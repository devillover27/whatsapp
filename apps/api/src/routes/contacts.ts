import { FastifyPluginAsync } from 'fastify'
import { createContact, getContacts } from '../services/contact.service.js'
import { ContactSchema } from '@workspace/shared'
import { prisma } from '../lib/prisma.js'

const contactRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/contacts', async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace'

      const body = ContactSchema.parse(request.body)
      const contact = await prisma.contact.create({
        data: {
          ...body,
          workspaceId
        }
      })
      
      return contact
    } catch (e: any) {
      if (e.name === 'ZodError') {
        return reply.status(400).send({ error: e.errors })
      }
      return reply.status(400).send({ error: e.message || 'Failed to create contact' })
    }
  })

  fastify.get('/contacts', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string
    if (!workspaceId) {
      return reply.status(400).send({ error: 'Missing x-workspace-id header' })
    }

    return getContacts(workspaceId)
  })
}

export default contactRoutes
