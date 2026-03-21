import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { prisma } from './lib/prisma.js'
import campaignRoutes from './routes/campaigns.js'
import contactRoutes from './routes/contacts.js'
import webhookRoutes from './routes/webhooks.js'
import dashboardRoutes from './routes/dashboard.js'
import appointmentRoutes from './routes/appointments.js'
import serviceRoutes from './routes/services.js'

const fastify = Fastify({
  logger: true,
})

// Register plugins
await fastify.register(cors)
await fastify.register(helmet)
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
})
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// Register routes
await fastify.register(campaignRoutes)
await fastify.register(contactRoutes)
await fastify.register(webhookRoutes)
await fastify.register(dashboardRoutes)
await fastify.register(appointmentRoutes)
await fastify.register(serviceRoutes)

// Health check
fastify.get('/health', async () => {
  return { status: 'OK', database: 'connected' }
})

// Start server
const start = async () => {
  try {
    // Ensure default workspace exists to prevent 500 FK constraint errors
    await prisma.workspace.upsert({
      where: { id: 'default-workspace' },
      update: {},
      create: {
        id: 'default-workspace',
        name: 'Default Workspace',
        phoneNumberId: '123456789',
        wabaId: '123456789',
        metaAccessToken: 'dummy-token',
        planId: 'FREE'
      }
    })

    // Seed default services for the chatbot
    const defaultServices = [
      { name: 'General Consultation', duration: 30, description: 'Standard consultation appointment' },
      { name: 'Follow-up Visit', duration: 20, description: 'Follow-up on previous consultation' },
      { name: 'New Patient Appointment', duration: 45, description: 'First-time patient registration & checkup' },
    ];
    for (const svc of defaultServices) {
      await prisma.service.upsert({
        where: { workspaceId_name: { workspaceId: 'default-workspace', name: svc.name } },
        update: {},
        create: { workspaceId: 'default-workspace', ...svc },
      });
    }
    console.log('[Server] Default services seeded');

    const port = Number(process.env.PORT) || 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server listening on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
