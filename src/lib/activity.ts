import { prisma } from './prisma'

export async function recordActivity(
  workspaceId: string,
  kind: string,
  message: string,
  messageEn: string,
) {
  await prisma.activity.create({ data: { workspaceId, kind, message, messageEn } })
}
