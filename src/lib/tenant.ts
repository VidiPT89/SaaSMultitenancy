import { prisma } from './prisma'
import type { User } from '@prisma/client'

export async function membershipFor(user: User, slug: string) {
  return prisma.membership.findFirst({
    where: { userId: user.id, workspace: { slug } },
    include: {
      workspace: {
        include: {
          members: { include: { user: true }, orderBy: { createdAt: 'asc' } },
          invites: { where: { acceptedAt: null }, orderBy: { createdAt: 'desc' } },
          billing: { orderBy: { createdAt: 'desc' }, take: 12 },
        },
      },
    },
  })
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
}
