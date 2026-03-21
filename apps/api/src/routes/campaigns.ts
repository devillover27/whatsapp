import { FastifyPluginAsync } from 'fastify'
import { createCampaign } from '../services/campaign.service.js'
import { CreateCampaignSchema } from '@workspace/shared'
import { prisma } from '../lib/prisma.js'

const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/campaigns', async (request, reply) => {
    try {
      const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace'

      const body = CreateCampaignSchema.parse(request.body)
      const campaign = await createCampaign(workspaceId, body)
      
      return campaign
    } catch (e: any) {
      if (e.name === 'ZodError') {
        return reply.status(400).send({ error: e.errors })
      }
      return reply.status(400).send({ error: e.message || 'Failed to create campaign' })
    }
  })

  fastify.get('/campaigns', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace'
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    })
    return campaigns
  })
}

export default campaignRoutes
