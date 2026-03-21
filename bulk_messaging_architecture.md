# WhatsApp Bulk Messaging — Build Guide
### WhatsApp Cloud API · Node.js · BullMQ · Redis · PostgreSQL · ClickHouse

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema)
6. [Campaign Service](#6-campaign-service)
7. [Audience Resolver](#7-audience-resolver)
8. [BullMQ Job Queue](#8-bullmq-job-queue)
9. [Rate Limiter (Token Bucket)](#9-rate-limiter-token-bucket)
10. [Meta Cloud API Sender](#10-meta-cloud-api-sender)
11. [Webhook Processor](#11-webhook-processor)
12. [Real-time Analytics](#12-real-time-analytics)
13. [Error Handling & DLQ](#13-error-handling--dlq)
14. [API Routes Reference](#14-api-routes-reference)
15. [Deployment Checklist](#15-deployment-checklist)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT ZONE                        │
│   React Dashboard   │  REST Client  │  3rd-party APIs   │
└────────────┬────────┴───────────────┴──────────┬────────┘
             │                                   │
             ▼                                   │
┌────────────────────────────────────────────────▼────────┐
│               API GATEWAY (Fastify)                     │
│         JWT Auth · Rate Limit · Request Routing         │
└───────────────────────┬─────────────────────────────────┘
                        │
       ┌────────────────┼──────────────────────┐
       ▼                ▼                      ▼
  Campaign Svc     Contact Svc         Template Svc
  (create/track)   (segments/optin)    (CRUD/Meta sync)
       │
       ▼
┌──────────────────────────────────────┐
│        MESSAGING ENGINE              │
│  BullMQ Workers  ·  Rate Limiter     │
│  (Redis-backed)  ·  (Token Bucket)   │
└──────────────────────┬───────────────┘
                       │  POST /messages
                       ▼
             ┌─────────────────┐
             │  Meta Cloud API │  ◄──── Webhook callbacks
             │ graph.facebook  │        (sent/delivered/
             │    .com/v20     │         read/failed)
             └─────────────────┘
                       │ webhook
                       ▼
             Webhook Processor
             (verify → queue → parse → route)
                       │
          ┌────────────┴──────────────┐
          ▼                           ▼
   Status updates              Inbound messages
   (ClickHouse +               (chatbot / live chat)
    Redis counters)

DATA LAYER
  PostgreSQL · Redis · ClickHouse · S3
```

### Flow summary

1. User creates campaign via dashboard
2. Campaign service validates template, quota, opt-ins → saves to DB
3. Audience resolver paginates contacts → pushes jobs to BullMQ
4. Workers consume jobs → check Redis token bucket → POST to Meta
5. Meta returns `message_id` → saved to DB, counter incremented
6. Meta fires webhook → processor verifies signature → returns 200 → async handle
7. Status events update ClickHouse + Redis counters → push to dashboard via Socket.io

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js 20 LTS | Non-blocking I/O |
| Framework | Fastify 4 | 2-3x faster than Express |
| Job Queue | BullMQ + Redis 7 | Reliable at-least-once delivery |
| ORM | Prisma 5 | Type-safe, migrations |
| Primary DB | PostgreSQL 16 | Campaigns, contacts, templates |
| Cache / Queues | Redis 7 (Cluster) | Token bucket, BullMQ, counters |
| Analytics DB | ClickHouse | High-speed event writes/queries |
| Realtime | Socket.io | Dashboard live updates |
| Validation | Zod | Shared frontend/backend schemas |
| Testing | Vitest + Supertest | Unit + integration |
| Monitoring | Prometheus + Grafana | Queue depth, error rates |
| Error tracking | Sentry | Alerts on DLQ fills |

---

## 3. Project Structure

```
apps/
  api/                        ← Fastify API server
    src/
      routes/
        campaigns.ts
        contacts.ts
        templates.ts
        webhooks.ts
      services/
        campaign.service.ts
        audience.service.ts
        template.service.ts
      middleware/
        auth.ts
        rateLimit.ts

services/
  messaging/                  ← Messaging engine (separate process)
    src/
      workers/
        sender.worker.ts      ← BullMQ worker — core sending loop
        webhook.worker.ts     ← Webhook event processor
      queues/
        campaign.queue.ts     ← Queue definitions
        webhook.queue.ts
      meta/
        client.ts             ← Meta Cloud API wrapper
        types.ts              ← Meta API request/response types
      redis/
        tokenBucket.ts        ← Rate limiter implementation
        counters.ts           ← Campaign counter helpers
      clickhouse/
        events.ts             ← ClickHouse batch writer

packages/
  shared/
    schemas/                  ← Zod schemas shared across services
    types/                    ← TypeScript interfaces

prisma/
  schema.prisma               ← DB schema
  migrations/

infra/
  docker-compose.yml
  k8s/
  terraform/
```

---

## 4. Environment Variables

Create `.env` in each service root. Never commit these.

```bash
# ── Database ──────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@localhost:5432/wa_saas"
REDIS_URL="redis://localhost:6379"
CLICKHOUSE_URL="http://localhost:8123"
CLICKHOUSE_DB="messaging"

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET="replace-with-256-bit-random-secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="30d"

# ── Meta / WhatsApp Cloud API ──────────────────────────────
META_APP_ID="your_app_id"
META_APP_SECRET="your_app_secret"          # used for webhook HMAC verify
META_WABA_ID="your_waba_id"
META_PHONE_NUMBER_ID="your_phone_number_id"
META_ACCESS_TOKEN="your_system_user_token"
META_API_VERSION="v20.0"
META_WEBHOOK_VERIFY_TOKEN="random_string_you_set_in_meta_dashboard"

# ── Messaging Engine ───────────────────────────────────────
SENDER_CONCURRENCY=50          # BullMQ worker concurrency
RATE_LIMIT_PER_SEC=1000        # Meta max: 1000/sec per phone number
BATCH_SIZE=500                 # Jobs pushed per audience page

# ── Storage ───────────────────────────────────────────────
S3_BUCKET="your-media-bucket"
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# ── Monitoring ────────────────────────────────────────────
SENTRY_DSN="https://..."
```

---

## 5. Database Schema

### Prisma schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Workspace {
  id              String   @id @default(uuid())
  name            String
  wabaId          String   @unique
  phoneNumberId   String
  metaAccessToken String   // AES-256 encrypted at rest
  qualityRating   String   @default("green") // green | yellow | red
  planId          String
  createdAt       DateTime @default(now())

  contacts    Contact[]
  campaigns   Campaign[]
  templates   MessageTemplate[]
}

model Contact {
  id          String    @id @default(uuid())
  workspaceId String
  phone       String                        // E.164 format
  name        String?
  attributes  Json      @default("{}")      // custom fields
  tags        String[]
  optedIn     Boolean   @default(false)
  optedInAt   DateTime?
  lastSeenAt  DateTime?
  createdAt   DateTime  @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([workspaceId, phone])
  @@index([workspaceId, optedIn])
  @@index([workspaceId, tags])
}

model MessageTemplate {
  id             String   @id @default(uuid())
  workspaceId    String
  name           String                     // snake_case, used in API calls
  category       String                     // MARKETING | UTILITY | AUTHENTICATION
  language       String                     // en_US | hi | etc.
  headerType     String?                    // TEXT | IMAGE | VIDEO | DOCUMENT
  headerValue    String?
  body           String                     // template body with {{variables}}
  footer         String?
  buttons        Json?                      // CTA / quick reply config
  metaStatus     String   @default("PENDING") // PENDING | APPROVED | REJECTED
  metaTemplateId String?
  createdAt      DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  campaigns Campaign[]

  @@unique([workspaceId, name, language])
}

model Campaign {
  id             String   @id @default(uuid())
  workspaceId    String
  name           String
  templateId     String
  audienceType   String                     // segment | tag | all | csv
  audienceRef    String?                    // segment ID or tag name
  variableMap    Json     @default("{}")    // { "1": "first_name", "2": "order_id" }
  status         String   @default("draft") // draft|scheduled|running|completed|paused|failed
  scheduledAt    DateTime?
  startedAt      DateTime?
  completedAt    DateTime?
  totalContacts  Int      @default(0)
  sent           Int      @default(0)
  delivered      Int      @default(0)
  read           Int      @default(0)
  failed         Int      @default(0)
  createdAt      DateTime @default(now())

  workspace Workspace      @relation(fields: [workspaceId], references: [id])
  template  MessageTemplate @relation(fields: [templateId], references: [id])

  @@index([workspaceId, status])
  @@index([scheduledAt])
}
```

### ClickHouse schema (`message_events` table)

```sql
CREATE TABLE IF NOT EXISTS messaging.message_events (
  message_id    String,
  workspace_id  String,
  campaign_id   Nullable(String),
  contact_id    String,
  phone         String,
  direction     Enum8('outbound' = 1, 'inbound' = 2),
  msg_type      String,          -- text, template, image, audio, document
  status        String,          -- sent, delivered, read, failed
  error_code    Nullable(String),
  error_msg     Nullable(String),
  ts            DateTime64(3)    -- millisecond precision
) ENGINE = MergeTree()
ORDER BY (workspace_id, ts)
PARTITION BY toYYYYMM(ts)
TTL ts + INTERVAL 1 YEAR;
```

---

## 6. Campaign Service

### `campaign.service.ts`

```typescript
import { prisma } from '../lib/prisma'
import { campaignQueue } from '../../messaging/queues/campaign.queue'

export async function createCampaign(
  workspaceId: string,
  input: CreateCampaignInput
) {
  // 1. Validate template is APPROVED
  const template = await prisma.messageTemplate.findFirstOrThrow({
    where: { id: input.templateId, workspaceId, metaStatus: 'APPROVED' }
  })

  // 2. Check plan quota (use Redis counter for speed)
  await assertQuotaAvailable(workspaceId)

  // 3. Save campaign as draft
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId,
      name: input.name,
      templateId: template.id,
      audienceType: input.audienceType,
      audienceRef: input.audienceRef ?? null,
      variableMap: input.variableMap ?? {},
      status: 'draft',
      scheduledAt: input.scheduledAt ?? null
    }
  })

  // 4. If immediate send, kick off now; else scheduler handles it
  if (!input.scheduledAt) {
    await launchCampaign(campaign.id)
  }

  return campaign
}

export async function launchCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { template: true }
  })

  // Resolve total audience count first
  const total = await countAudience(campaign.workspaceId, campaign)

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'running', startedAt: new Date(), totalContacts: total }
  })

  // Delegate to audience resolver — it pages and enqueues
  await enqueueAudience(campaign)
}
```

---

## 7. Audience Resolver

Pages through contacts in batches of `BATCH_SIZE` (500) so you never load the full list into memory.

### `audience.service.ts`

```typescript
import { prisma } from '../lib/prisma'
import { campaignQueue } from '../../messaging/queues/campaign.queue'

const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 500

export async function enqueueAudience(campaign: Campaign & { template: MessageTemplate }) {
  let cursor: string | undefined = undefined
  let totalEnqueued = 0

  while (true) {
    // Build audience filter
    const where = buildAudienceWhere(campaign)

    const contacts = await prisma.contact.findMany({
      where: { ...where, optedIn: true },   // CRITICAL: only opted-in contacts
      select: { id: true, phone: true, name: true, attributes: true },
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' }
    })

    if (contacts.length === 0) break

    // Build BullMQ jobs for this batch
    const jobs = contacts.map(contact => ({
      name: 'send-message',
      data: {
        campaignId: campaign.id,
        workspaceId: campaign.workspaceId,
        phoneNumberId: campaign.workspace.phoneNumberId,
        accessToken: campaign.workspace.metaAccessToken,
        phone: contact.phone,
        contactId: contact.id,
        templateName: campaign.template.name,
        templateLanguage: campaign.template.language,
        components: resolveTemplateComponents(campaign.template, contact, campaign.variableMap)
      }
    }))

    // Bulk add to queue — single Redis roundtrip
    await campaignQueue.addBulk(jobs)

    totalEnqueued += contacts.length
    cursor = contacts[contacts.length - 1].id

    if (contacts.length < BATCH_SIZE) break
  }

  return totalEnqueued
}

function buildAudienceWhere(campaign: Campaign) {
  const base = { workspaceId: campaign.workspaceId }
  if (campaign.audienceType === 'all') return base
  if (campaign.audienceType === 'tag') return { ...base, tags: { has: campaign.audienceRef } }
  // segment → more complex query, omitted for brevity
  return base
}

function resolveTemplateComponents(
  template: MessageTemplate,
  contact: Contact,
  variableMap: Record<string, string>
) {
  // variableMap: { "1": "name", "2": "order_id" }
  // contact.attributes: { "name": "Arjun", "order_id": "ORD-999" }
  const bodyParams = Object.entries(variableMap).map(([_, field]) => ({
    type: 'text',
    text: String((contact.attributes as any)[field] ?? '')
  }))

  return [
    { type: 'body', parameters: bodyParams }
  ]
}
```

---

## 8. BullMQ Job Queue

### `campaign.queue.ts`

```typescript
import { Queue, QueueOptions } from 'bullmq'
import { redisConnection } from '../redis/connection'

const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000       // 1s, 2s, 4s, 8s, 16s
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: false   // keep failed jobs for DLQ review
}

export const campaignQueue = new Queue('campaign-send', {
  connection: redisConnection,
  defaultJobOptions
})

export const webhookQueue = new Queue('webhook-events', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 500 },
    removeOnComplete: { count: 5000 }
  }
})
```

### `sender.worker.ts`

```typescript
import { Worker, Job } from 'bullmq'
import { redisConnection } from '../redis/connection'
import { acquireToken } from '../redis/tokenBucket'
import { sendTemplateMessage } from '../meta/client'
import { incrementCounter } from '../redis/counters'
import { writeEvent } from '../clickhouse/events'
import { prisma } from '../../lib/prisma'

const CONCURRENCY = Number(process.env.SENDER_CONCURRENCY) || 50

const worker = new Worker(
  'campaign-send',
  async (job: Job) => {
    const { campaignId, workspaceId, phoneNumberId, accessToken, phone, contactId, templateName, templateLanguage, components } = job.data

    // 1. Acquire rate limit token — blocks until token available
    await acquireToken(phoneNumberId)

    // 2. Call Meta Cloud API
    const result = await sendTemplateMessage({
      phoneNumberId,
      accessToken,
      to: phone,
      templateName,
      languageCode: templateLanguage,
      components
    })

    // 3. Save message_id to DB for webhook matching
    await prisma.outboundMessage.create({
      data: {
        metaMessageId: result.messages[0].id,
        campaignId,
        workspaceId,
        contactId,
        phone,
        status: 'sent'
      }
    })

    // 4. Increment campaign sent counter in Redis (flush to DB periodically)
    await incrementCounter(campaignId, 'sent')

    // 5. Write to ClickHouse
    await writeEvent({
      message_id: result.messages[0].id,
      workspace_id: workspaceId,
      campaign_id: campaignId,
      contact_id: contactId,
      phone,
      direction: 'outbound',
      msg_type: 'template',
      status: 'sent',
      ts: new Date()
    })
  },
  {
    connection: redisConnection,
    concurrency: CONCURRENCY,
    limiter: {
      max: 1000,
      duration: 1000   // BullMQ-level safety net — token bucket is primary
    }
  }
)

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message)
})
```

---

## 9. Rate Limiter (Token Bucket)

This is the most critical piece. Meta allows 1,000 messages/second per phone number. The token bucket runs atomically in Redis using a Lua script.

### `tokenBucket.ts`

```typescript
import { redis } from './connection'

const RATE = Number(process.env.RATE_LIMIT_PER_SEC) || 1000
const REFILL_INTERVAL_MS = 1000

// Lua script: atomically consume one token, refill if interval elapsed
const ACQUIRE_SCRIPT = `
local key        = KEYS[1]
local now        = tonumber(ARGV[1])
local rate       = tonumber(ARGV[2])
local interval   = tonumber(ARGV[3])

local bucket     = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens     = tonumber(bucket[1]) or rate
local last       = tonumber(bucket[2]) or now

-- Refill if interval has passed
local elapsed    = now - last
if elapsed >= interval then
  tokens         = rate
  last           = now
end

if tokens > 0 then
  tokens         = tokens - 1
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last)
  redis.call('PEXPIRE', key, interval * 2)
  return 1        -- token acquired
else
  return 0        -- no token, caller must wait
end
`

export async function acquireToken(phoneNumberId: string): Promise<void> {
  const key = `rate:${phoneNumberId}`

  while (true) {
    const result = await redis.eval(
      ACQUIRE_SCRIPT,
      1,               // number of keys
      key,
      Date.now(),
      RATE,
      REFILL_INTERVAL_MS
    ) as number

    if (result === 1) return  // token acquired

    // No token available — wait 10ms and retry
    await sleep(10)
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
```

---

## 10. Meta Cloud API Sender

### `meta/client.ts`

```typescript
import axios, { AxiosInstance } from 'axios'

const BASE = `https://graph.facebook.com/${process.env.META_API_VERSION}`

export interface TemplateMessagePayload {
  phoneNumberId: string
  accessToken: string
  to: string                      // E.164 format e.g. +919876543210
  templateName: string
  languageCode: string
  components: ComponentObject[]
}

export interface ComponentObject {
  type: 'header' | 'body' | 'button'
  parameters?: ParameterObject[]
  sub_type?: string
  index?: string
}

export interface ParameterObject {
  type: 'text' | 'image' | 'document' | 'video' | 'payload'
  text?: string
  image?: { link: string }
  document?: { link: string; filename: string }
}

export async function sendTemplateMessage(payload: TemplateMessagePayload) {
  const url = `${BASE}/${payload.phoneNumberId}/messages`

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: payload.to,
    type: 'template',
    template: {
      name: payload.templateName,
      language: { code: payload.languageCode },
      components: payload.components
    }
  }

  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
      'Content-Type': 'application/json'
    },
    timeout: 10_000   // 10 second timeout
  })

  return response.data as { messages: [{ id: string }] }
}

// Send a free-form text message (only within 24h customer-initiated window)
export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
) {
  const url = `${BASE}/${phoneNumberId}/messages`

  const response = await axios.post(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text, preview_url: false }
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  return response.data
}
```

---

## 11. Webhook Processor

### Route: `routes/webhooks.ts`

```typescript
import { FastifyPluginAsync } from 'fastify'
import crypto from 'crypto'
import { webhookQueue } from '../../messaging/queues/campaign.queue'

const webhookRoutes: FastifyPluginAsync = async (fastify) => {

  // Meta calls GET to verify your webhook endpoint during setup
  fastify.get('/webhook', async (req, reply) => {
    const mode      = (req.query as any)['hub.mode']
    const token     = (req.query as any)['hub.verify_token']
    const challenge = (req.query as any)['hub.challenge']

    if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
      return reply.send(challenge)       // return challenge to confirm
    }
    return reply.status(403).send('Forbidden')
  })

  // Meta sends all events here
  fastify.post('/webhook', {
    config: { rawBody: true }            // CRITICAL: need raw body for HMAC
  }, async (req, reply) => {

    // 1. Verify signature FIRST — reject spoofed requests
    const signature = req.headers['x-hub-signature-256'] as string
    if (!verifySignature(req.rawBody as Buffer, signature)) {
      return reply.status(401).send('Invalid signature')
    }

    // 2. Return 200 IMMEDIATELY — before any processing
    //    Meta will retry if you take > 5 seconds
    reply.status(200).send('OK')

    // 3. Push to Redis queue for async processing (fire-and-forget)
    await webhookQueue.add('process-webhook', req.body, {
      priority: 1   // high priority
    })
  })
}

function verifySignature(rawBody: Buffer, signatureHeader: string): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false

  const expected = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(rawBody)
    .digest('hex')

  const received = signatureHeader.replace('sha256=', '')

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(received, 'hex')
  )
}

export default webhookRoutes
```

### Worker: `webhook.worker.ts`

```typescript
import { Worker, Job } from 'bullmq'
import { redisConnection } from '../redis/connection'
import { prisma } from '../../lib/prisma'
import { incrementCounter } from '../redis/counters'
import { writeEvent } from '../clickhouse/events'
import { io } from '../../api/socket'    // Socket.io instance

const worker = new Worker('webhook-events', async (job: Job) => {
  const payload = job.data
  const changes = payload?.entry?.[0]?.changes?.[0]?.value

  if (!changes) return

  // ── Status update (sent / delivered / read / failed) ──
  if (changes.statuses) {
    for (const status of changes.statuses) {
      await handleStatusUpdate(status)
    }
  }

  // ── Inbound message from customer ──
  if (changes.messages) {
    for (const message of changes.messages) {
      await handleInboundMessage(message, changes.metadata)
    }
  }
}, { connection: redisConnection, concurrency: 20 })


async function handleStatusUpdate(status: MetaStatusObject) {
  const { id: metaMessageId, status: newStatus, timestamp } = status

  // Find the outbound message by Meta's message ID
  const msg = await prisma.outboundMessage.findUnique({
    where: { metaMessageId }
  })
  if (!msg) return

  // Update message status
  await prisma.outboundMessage.update({
    where: { metaMessageId },
    data: { status: newStatus }
  })

  // Increment campaign counter (delivered / read / failed)
  if (msg.campaignId && ['delivered', 'read', 'failed'].includes(newStatus)) {
    await incrementCounter(msg.campaignId, newStatus as any)

    // Push real-time update to dashboard via Socket.io
    io.to(`campaign:${msg.campaignId}`).emit('counter-update', {
      campaignId: msg.campaignId,
      field: newStatus,
      value: await getCounter(msg.campaignId, newStatus)
    })
  }

  // Write to ClickHouse
  await writeEvent({
    message_id: metaMessageId,
    workspace_id: msg.workspaceId,
    campaign_id: msg.campaignId,
    contact_id: msg.contactId,
    phone: status.recipient_id,
    direction: 'outbound',
    msg_type: 'template',
    status: newStatus,
    error_code: status.errors?.[0]?.code?.toString(),
    error_msg: status.errors?.[0]?.title,
    ts: new Date(Number(timestamp) * 1000)
  })
}


async function handleInboundMessage(message: MetaMessageObject, metadata: any) {
  const phone = message.from
  const workspacePhoneNumberId = metadata.phone_number_id

  // Find workspace by phone number ID
  const workspace = await prisma.workspace.findFirst({
    where: { phoneNumberId: workspacePhoneNumberId }
  })
  if (!workspace) return

  // Upsert contact
  const contact = await prisma.contact.upsert({
    where: { workspaceId_phone: { workspaceId: workspace.id, phone } },
    update: { lastSeenAt: new Date() },
    create: { workspaceId: workspace.id, phone, optedIn: true, optedInAt: new Date() }
  })

  // Route to chatbot engine or live chat service
  // (implementation depends on your bot/live-chat module)
  await routeInboundMessage(workspace.id, contact.id, message)
}
```

---

## 12. Real-time Analytics

### Counter helpers: `redis/counters.ts`

```typescript
import { redis } from './connection'
import { prisma } from '../../lib/prisma'

type CounterField = 'sent' | 'delivered' | 'read' | 'failed'

// Increment in Redis — fast, no DB hit on every message
export async function incrementCounter(campaignId: string, field: CounterField) {
  const key = `campaign:${campaignId}:${field}`
  await redis.incr(key)
  await redis.expire(key, 86400)  // 24h TTL safety
}

export async function getCounter(campaignId: string, field: CounterField): Promise<number> {
  const val = await redis.get(`campaign:${campaignId}:${field}`)
  return Number(val) || 0
}

// Run periodically (e.g. every 30s via cron) to flush Redis → Postgres
export async function flushCounters(campaignId: string) {
  const [sent, delivered, read, failed] = await Promise.all([
    getCounter(campaignId, 'sent'),
    getCounter(campaignId, 'delivered'),
    getCounter(campaignId, 'read'),
    getCounter(campaignId, 'failed')
  ])

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { sent, delivered, read, failed }
  })
}
```

### ClickHouse batch writer: `clickhouse/events.ts`

```typescript
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  database: process.env.CLICKHOUSE_DB
})

const BUFFER: EventRow[] = []
const FLUSH_SIZE = 200
const FLUSH_INTERVAL_MS = 5000

// Buffer events — flush in batches for ClickHouse efficiency
export async function writeEvent(event: EventRow) {
  BUFFER.push(event)
  if (BUFFER.length >= FLUSH_SIZE) await flush()
}

async function flush() {
  if (BUFFER.length === 0) return
  const rows = BUFFER.splice(0, BUFFER.length)

  await client.insert({
    table: 'message_events',
    values: rows,
    format: 'JSONEachRow'
  })
}

// Flush on timer regardless of buffer size
setInterval(flush, FLUSH_INTERVAL_MS)

// Analytics query example — delivery rate for a campaign
export async function getCampaignStats(campaignId: string) {
  const result = await client.query({
    query: `
      SELECT
        status,
        count() as count
      FROM message_events
      WHERE campaign_id = {campaign_id: String}
      GROUP BY status
    `,
    query_params: { campaign_id: campaignId },
    format: 'JSONEachRow'
  })
  return result.json()
}
```

---

## 13. Error Handling & DLQ

### Retry policy (set on queue)

| Attempt | Delay    | Total wait |
|---------|----------|------------|
| 1st     | 1 second | 1s         |
| 2nd     | 2 seconds| 3s         |
| 3rd     | 4 seconds| 7s         |
| 4th     | 8 seconds| 15s        |
| 5th     | 16 seconds| 31s       |
| After 5 | Dead-letter queue | — |

### DLQ monitor: `workers/dlq.monitor.ts`

```typescript
import { Queue, QueueEvents } from 'bullmq'
import { redisConnection } from '../redis/connection'
import Sentry from '@sentry/node'

const campaignQueue = new Queue('campaign-send', { connection: redisConnection })
const queueEvents = new QueueEvents('campaign-send', { connection: redisConnection })

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await campaignQueue.getJob(jobId)

  // Only alert on final failure (all attempts exhausted)
  if (job && job.attemptsMade >= job.opts.attempts!) {
    Sentry.captureException(new Error(`DLQ: ${failedReason}`), {
      extra: { jobId, data: job.data }
    })
    // Optionally: write to dlq_jobs table for manual retry UI
    await logToDLQ(job)
  }
})

// Common Meta error codes to handle specifically
export function classifyMetaError(errorCode: number): 'retry' | 'skip' | 'pause' {
  if ([130429, 131048, 131056].includes(errorCode)) return 'retry'   // rate limit
  if ([131026, 131047].includes(errorCode)) return 'skip'            // invalid number / not on WA
  if ([131031].includes(errorCode)) return 'pause'                   // account locked
  return 'retry'
}
```

---

## 14. API Routes Reference

### Campaigns

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/campaigns` | Create campaign |
| `GET` | `/api/campaigns` | List campaigns (paginated) |
| `GET` | `/api/campaigns/:id` | Get campaign + live counters |
| `POST` | `/api/campaigns/:id/launch` | Manually launch draft |
| `POST` | `/api/campaigns/:id/pause` | Pause running campaign |
| `POST` | `/api/campaigns/:id/resume` | Resume paused campaign |
| `GET` | `/api/campaigns/:id/stats` | Delivery analytics |

### Contacts

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/contacts/import` | Bulk CSV import |
| `GET` | `/api/contacts` | List with filters |
| `POST` | `/api/contacts/:id/optout` | Mark contact as opted-out |

### Templates

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/templates` | Create + submit to Meta |
| `GET` | `/api/templates` | List all with Meta status |
| `POST` | `/api/templates/sync` | Pull latest status from Meta |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/webhook` | Meta verification handshake |
| `POST` | `/webhook` | All Meta event callbacks |

---

## 15. Deployment Checklist

### Before going live

- [ ] Meta Business Manager verified (GSTIN / PAN for India)
- [ ] Facebook Developer App created with WhatsApp product added
- [ ] Phone number registered — no existing WhatsApp account on it
- [ ] System User created in Meta Business Manager
- [ ] System User access token generated (never expires)
- [ ] Webhook URL registered in Meta Developer Console
- [ ] `META_WEBHOOK_VERIFY_TOKEN` matches what you set in Meta console
- [ ] All message templates submitted and **APPROVED** by Meta
- [ ] HMAC signature verification tested end-to-end
- [ ] Rate limiter tested at 1000 msg/sec — check Redis token bucket
- [ ] BullMQ DLQ alerts configured in Sentry
- [ ] ClickHouse table created with correct TTL and partition key
- [ ] Redis cluster mode enabled for production
- [ ] Postgres RLS policies enabled per workspace
- [ ] All `.env` secrets loaded from AWS Secrets Manager (not hardcoded)
- [ ] SSL/TLS on all endpoints — Meta will reject non-HTTPS webhooks
- [ ] Opt-in proof stored for every contact — required by WhatsApp policy

### Monitoring to set up

- [ ] BullMQ queue depth alert (> 10,000 jobs stuck → PagerDuty)
- [ ] Meta quality rating poller — alert if drops to yellow or red
- [ ] DLQ fill rate dashboard in Grafana
- [ ] ClickHouse insert lag alert
- [ ] Redis memory usage alert (> 70%)

---

## Key Rules to Never Break

> **Never send to non-opted-in contacts.** Enforced in audience resolver with `optedIn: true` filter. Violating this will drop your quality rating to red and can get your number banned.

> **Always verify the HMAC signature** on every webhook request before trusting its payload.

> **Return HTTP 200 before processing** the webhook. If Meta doesn't receive 200 within 5 seconds it retries — you'll get duplicate events.

> **Never call Meta API directly from campaign service.** Always go through BullMQ workers. This ensures rate limiting, retries, and backpressure are respected.

> **Use E.164 phone format** for all numbers (e.g. `+919876543210`). Meta will reject anything else.

---

*Document version 1.0 — WhatsApp Cloud API v20.0*
