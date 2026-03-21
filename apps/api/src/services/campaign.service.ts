import { prisma } from '../lib/prisma.js'
import { campaignQueue } from '@workspace/messaging/queues/campaign.queue.js'
import { CreateCampaignInput } from '@workspace/shared'
import { enqueueAudience } from './audience.service.js'

export async function createCampaign(workspaceId: string, input: CreateCampaignInput) {
  // 1. Validate template exists (allowing PENDING for local testing purposes)
  const template = await prisma.messageTemplate.findFirst({
    where: { id: input.templateId, workspaceId },
  })
  
  if (!template) {
    throw new Error('Template not found.');
  }

  // 2. Save campaign as draft
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId,
      name: input.name,
      templateId: template.id,
      audienceType: input.audienceType,
      audienceRef: input.audienceRef ?? null,
      variableMap: input.variableMap ?? {},
      status: 'draft',
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    },
  })

  // 3. If immediate send, kick off now
  if (!input.scheduledAt) {
    await launchCampaign(campaign.id)
  }

  return campaign
}

export async function launchCampaign(campaignId: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'running', startedAt: new Date() },
  })

  // Resolve total audience count and enqueue jobs
  const total = await enqueueAudience(campaignId)

  console.log(`Campaign ${campaignId} launched with ${total} contacts`)
}
