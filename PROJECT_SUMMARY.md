# WhatsApp Bulk Messaging Platform - Project Summary

## Overview
This platform is a scalable, monorepo-based application designed to manage, schedule, and send bulk WhatsApp messages using the official **Meta Cloud API**. It features a modern React Glassmorphism frontend dashboard, a high-performance Fastify backend, and a robust background messaging worker powered by Redis and BullMQ to handle thousands of messages reliably.

---

## 🏗 System Architecture (Monorepo)

The project leverages npm workspaces and is divided into three core packages:

### 1. Frontend Web App (`apps/web`)
- **Framework**: React.js with Vite
- **Styling**: Premium Vanilla CSS (Glassmorphism, custom animations, sleek dark mode tailored color palette)
- **Routing**: React Router DOM
- **Responsibilities**: 
  - Visualizing Campaign statistics and delivery rates.
  - Creating and launching Campaign schedules.
  - Adding Contacts manually or via real `.csv` file imports.
  - Synchronizing, creating, and deleting Meta WhatsApp Message Templates.

### 2. Core API Backend (`apps/api`)
- **Framework**: Node.js & Fastify
- **Database ORM**: Prisma (PostgreSQL)
- **Validation**: Zod (Shared schemas)
- **Responsibilities**:
  - Exposing REST API web endpoints to perfectly map frontend actions into database inputs.
  - Securing endpoints and processing cross-origin (CORS) dashboard requests.
  - Enqueuing audiences (chunking large contact batches into smaller Redis tasks) for campaigns.
  - Intercepting automated Webhooks heavily directly from Meta (template approval state changes, inbound chat messages).

### 3. Background Messaging Worker (`services/messaging`)
- **Queue System**: BullMQ backed by Redis
- **Responsibilities**:
  - Processing the `campaign-send` queue fully asynchronously so the web dashboard never hangs.
  - Managing strict rate limits using a Token Bucket algorithm to avoid Meta block-bans.
  - Executing actual HTTP POST requests to the Meta Graph API.
  - Updating individual Outbound Message statuses (Delivered, Read, Failed) in PostgreSQL.

---

## 🚀 Core Features Built

1. **Dashboard Analytics**: Real-time aggregated statistics pulling live data from Prisma on the Home Page.
2. **Template Syncing & Authoring**: Fully integrates with Meta. You can pull templates natively from Meta, delete them, or author new ones within the dashboard (which automatically pushes to Meta for review).
3. **Automated Webhooks**: Meta pings the backend automatically `/webhook` endpoint to instantly update template states from `PENDING` to `APPROVED` or `REJECTED`, entirely automating the administrative sync process.
4. **CSV Contact Importing**: The React frontend utilizes a dynamic `FileReader` engine to consume and parse hundreds of `.csv` rows instantaneously, pushing them into bulk database batches.
5. **Campaign Engine**: Users can select an Audience, attach a customized Marketing/Utility Template, and seamlessly enqueue thousands of messages.

---

## 🛠 Tech Stack Snapshot
| Category | Technology Used |
|----------|-----------------|
| **Frontend UI** | React 18, Vite, Lucide React (Icons), Axios |
| **Backend API** | Fastify, Node.js, Zod, Cloudinary (Media handling) |
| **Database** | PostgreSQL |
| **ORM** | Prisma v5 |
| **Queues/Caching** | Redis, BullMQ |
| **External APIs** | Meta WhatsApp Cloud API (Graph API v20.0+) |

---

## 💻 Local Development Requirements

To run this complex stack locally, your machine requires:
1. **Node.js** (v18+)
2. **PostgreSQL** Database (Running locally or hosted)
3. **Redis** Server (Crucial for the background background messaging threads)
4. **ngrok** (Used exclusively to expose your `localhost:3000` to the public internet so the Meta server can send you webhooks dynamically).

### Setup Commands
1. **Install everything**: `npm install`
2. **Migrate DB**: `npm run prisma:push`
3. **Start Dashboard**: `npm run dev --workspace=@workspace/web`
4. **Start Core API**: `npm run dev --workspace=@workspace/api`
5. **Start BullMQ Worker**: `npm run dev --workspace=@workspace/messaging`
