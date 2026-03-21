import { prisma } from '../lib/prisma.js'
import { ContactInput } from '@workspace/shared'

export async function createContact(workspaceId: string, input: ContactInput) {
  const contact = await prisma.contact.upsert({
    where: {
      workspaceId_phone: {
        workspaceId,
        phone: input.phone,
      },
    },
    update: {
      name: input.name,
      attributes: input.attributes,
      tags: input.tags,
      optedIn: input.optedIn,
    },
    create: {
      workspaceId,
      phone: input.phone,
      name: input.name,
      attributes: input.attributes,
      tags: input.tags,
      optedIn: input.optedIn,
    },
  })

  return contact
}

export async function getContacts(workspaceId: string) {
  return prisma.contact.findMany({
    where: { workspaceId },
  })
}
