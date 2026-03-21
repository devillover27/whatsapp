import { prisma } from '../lib/prisma.js'
import { campaignQueue } from '@workspace/messaging/queues/campaign.queue.js'

const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 500

export async function enqueueAudience(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { 
      template: true,
      workspace: true
    }
  })

  let cursor: string | undefined = undefined
  let totalEnqueued = 0

  while (true) {
    const contacts = await prisma.contact.findMany({
      where: { 
        workspaceId: campaign.workspaceId,
        optedIn: true,
        // Add audience filtering logic here based on campaign.audienceType/Ref
      },
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' }
    })

    if (contacts.length === 0) break

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
        components: [] // Resolve components here based on variableMap
      }
    }))

    await campaignQueue.addBulk(jobs)

    totalEnqueued += contacts.length
    cursor = contacts[contacts.length - 1].id

    if (contacts.length < BATCH_SIZE) break
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { totalContacts: totalEnqueued }
  })

  return totalEnqueued
}
