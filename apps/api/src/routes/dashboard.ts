import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getTemplates, getWabaInsights } from '@workspace/messaging/lib/meta.js'

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

  // Bulk Import with Upsert to ensure optedIn = true
  fastify.post('/contacts/bulk', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    const body = request.body as { contacts: Array<{phone: string, name: string, tags: string[]}> };
    
    if (!body?.contacts?.length) return { message: 'No contacts provided' };

    let count = 0;
    try {
      // Use transactional upserts to ensure all contacts are marked as optedIn
      for (const c of body.contacts) {
        if (!c.phone) continue;
        await prisma.contact.upsert({
          where: { workspaceId_phone: { workspaceId, phone: c.phone } },
          update: { optedIn: true, name: c.name, tags: c.tags || [] },
          create: { workspaceId, phone: c.phone, name: c.name, tags: c.tags || [], optedIn: true }
        });
        count++;
      }
      return { success: true, count };
    } catch (e: any) {
      return reply.status(500).send({ error: e.message });
    }
  })

  // Sync Meta Templates (REAL)
  fastify.post('/templates/sync', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    
    try {
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (!workspace) return reply.status(404).send({ error: 'Workspace not found' });

      // Fetch from Meta
      const metaTemplates = await getTemplates(workspace.wabaId, workspace.metaAccessToken);
      
      if (!metaTemplates?.data) return { success: true, count: 0, message: 'No templates found on Meta' };

      // Upsert into our DB
      for (const t of metaTemplates.data) {
        await prisma.messageTemplate.upsert({
          where: { workspaceId_name_language: { workspaceId, name: t.name, language: t.language } },
          update: {
            category: t.category,
            body: t.components.find((c: any) => c.type === 'BODY')?.text || '',
            metaStatus: t.status,
            metaTemplateId: t.id
          },
          create: {
            workspaceId,
            name: t.name,
            language: t.language,
            category: t.category,
            body: t.components.find((c: any) => c.type === 'BODY')?.text || '',
            metaStatus: t.status,
            metaTemplateId: t.id
          }
        });
      }
      
      return { success: true, count: metaTemplates.data.length };
    } catch (e: any) {
      return reply.status(500).send({ error: 'Failed to sync with Meta: ' + e.message });
    }
  })

  // Delivery Analytics Report
  fastify.get('/analytics/messages', async (request) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return campaigns.map(c => ({
      id: c.id,
      name: c.name,
      sent: c.sent,
      delivered: c.delivered,
      read: c.read,
      failed: c.failed,
      deliveryRate: c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(1) : 0,
      readRate: c.sent > 0 ? ((c.read / c.sent) * 100).toFixed(1) : 0,
      createdAt: c.createdAt
    }));
  })

  // Booking / Appointment Report
  fastify.get('/analytics/appointments', async (request) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    
    const appointments = await prisma.appointment.findMany({
      where: { workspaceId },
      include: { service: true },
      orderBy: { date: 'asc' }
    });

    const total = appointments.length;
    const byService = appointments.reduce((acc: any, curr) => {
      acc[curr.service.name] = (acc[curr.service.name] || 0) + 1;
      return acc;
    }, {});

    return { total, byService, appointments };
  })

  // Meta Graph Insights
  fastify.get('/analytics/meta-insights', async (request, reply) => {
    const workspaceId = request.headers['x-workspace-id'] as string || 'default-workspace';
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return reply.status(404).send({ error: 'Workspace not found' });

    try {
      const insights = await getWabaInsights(workspace.wabaId, workspace.metaAccessToken);
      return insights;
    } catch (e: any) {
      return { error: 'Could not fetch Meta insights', message: e.message };
    }
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
