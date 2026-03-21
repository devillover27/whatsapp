import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/stats', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace'
    
    const [totalContacts, activeCampaigns, outbound] = await Promise.all([
      prisma.contact.count({ where: { workspaceId } }),
      prisma.campaign.count({ where: { workspaceId, status: 'running' } }),
      prisma.outboundMessage.findMany({ where: { workspaceId } })
    ])

    const messagesSent = outbound.length
    const delivered = outbound.filter(m => m.status === 'delivered' || m.status === 'read').length
    const deliveryRate = messagesSent > 0 ? ((delivered / messagesSent) * 100).toFixed(1) : 100.0

    return {
      totalContacts,
      activeCampaigns,
      messagesSent,
      deliveryRate
    }
  })

  fastify.get('/templates', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace'
    return prisma.messageTemplate.findMany({ where: { workspaceId } })
  })

  // Quick seeder for testing
  fastify.post('/seed', async (request, reply) => {
    const workspaceId = 'default-workspace'
    
    // Ensure workspace exists
    await prisma.workspace.upsert({
      where: { id: workspaceId },
      update: {},
      create: {
        id: workspaceId,
        name: 'Test Workspace',
        phoneNumberId: '123456789',
        wabaId: '123456789',
        metaAccessToken: 'dummy-token',
        planId: 'FREE'
      }
    })

    // Seed templates
    const t1 = await prisma.messageTemplate.upsert({
      where: { workspaceId_name_language: { workspaceId, name: 'marketing_promo_01', language: 'en_US' } },
      update: {},
      create: {
        workspaceId,
        name: 'marketing_promo_01',
        language: 'en_US',
        category: 'MARKETING',
        body: 'Hi {{1}}, huge sale!',
        metaStatus: 'APPROVED'
      }
    })

    // Seed contacts
    await prisma.contact.createMany({
      data: [
        { workspaceId, phone: '+15551234567', name: 'Alice', tags: ['VIP'], optedIn: true },
        { workspaceId, phone: '+15559876543', name: 'Bob', tags: ['Lead'], optedIn: false }
      ],
      skipDuplicates: true
    })

    return { success: true, message: 'Dummy data seeded successfully!' }
  })

  // Bulk CSV Import
  fastify.post('/contacts/bulk', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    const body = request.body as { contacts: Array<{phone: string, name: string, tags: string[]}> };
    
    if (!body?.contacts?.length) return { message: 'No contacts provided' };

    const data = body.contacts.map(c => ({
      workspaceId,
      phone: c.phone,
      name: c.name,
      tags: c.tags || [],
      optedIn: true
    }));

    await prisma.contact.createMany({ data, skipDuplicates: true });
    return { success: true, count: data.length };
  })

  // Sync Meta Templates (Mock)
  fastify.post('/templates/sync', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    
    // Create random templats
    await prisma.messageTemplate.createMany({
      data: [
        { workspaceId, name: 'order_update_v2', language: 'en_US', category: 'UTILITY', metaStatus: 'APPROVED', body: 'Your order {{1}} is out for delivery.' },
        { workspaceId, name: 'flash_sale_50', language: 'en_US', category: 'MARKETING', metaStatus: 'APPROVED', body: 'Hi {{1}}, 50% off everything!' }
      ],
      skipDuplicates: true
    });
    
    return { success: true, message: 'Templates successfully synced from Meta Business Account!' };
  })

  // Create Template endpoint manually
  fastify.post('/templates', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    const body = request.body as any;

    if (!body.name || !body.body) return reply.status(400).send({ error: 'Missing required fields' });

    const template = await prisma.messageTemplate.create({
      data: {
        workspaceId,
        name: body.name.toLowerCase().replace(/\s+/g, '_'),
        language: body.language || 'en_US',
        category: body.category || 'MARKETING',
        body: body.body,
        metaStatus: 'PENDING' // New templates must be reviewed by Meta
      }
    });
    return template;
  })

  // Delete Template manually
  fastify.delete('/templates/:id', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    const { id } = request.params as any;

    try {
      await prisma.messageTemplate.delete({
        where: { id, workspaceId }
      });
      return { success: true };
    } catch (e: any) {
      return reply.status(400).send({ error: 'Template not found or could not be deleted' });
    }
  })
}

export default dashboardRoutes
