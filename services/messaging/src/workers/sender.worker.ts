import { Worker, Job } from 'bullmq'
import { redisConnection } from '../redis/connection.js'
import { acquireToken } from '../lib/rate-limiter.js'
import { sendTemplateMessage } from '../lib/meta.js'
import { prisma } from '@workspace/api/lib/prisma'

const CONCURRENCY = Number(process.env.SENDER_CONCURRENCY) || 50

const worker = new Worker(
  'campaign-send',
  async (job: Job) => {
    const { 
      campaignId, 
      workspaceId, 
      phoneNumberId, 
      accessToken, 
      phone, 
      contactId, 
      templateName, 
      templateLanguage, 
      components 
    } = job.data

    // 1. Acquire rate limit token
    await acquireToken(phoneNumberId)

    try {
      // 2. Call Meta Cloud API
      const result = await sendTemplateMessage({
        phoneNumberId,
        accessToken,
        to: phone,
        templateName,
        languageCode: templateLanguage,
        components
      })

      const metaMessageId = result.messages[0].id

      // 3. Save to DB
      await prisma.outboundMessage.create({
        data: {
          metaMessageId,
          campaignId,
          workspaceId,
          contactId,
          phone,
          status: 'sent'
        }
      })

      // 4. Update campaign stats (optional, could be async)
      console.log(`Message sent to ${phone}: ${metaMessageId}`)

    } catch (error: any) {
      console.error(`Failed to send message to ${phone}:`, error.response?.data || error.message)
      throw error // BullMQ will retry based on job options
    }
  },
  {
    connection: redisConnection as any,
    concurrency: CONCURRENCY,
  }
)

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

console.log('Sender worker started')
