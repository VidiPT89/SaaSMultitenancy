import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { clerkServerEnabled } from './clerk'

const COOKIE = 'firma-session'

export async function currentUser() {
  if (clerkServerEnabled()) {
    const { currentUser: clerkUser } = await import('@clerk/nextjs/server')
    const clerk = await clerkUser()
    if (!clerk) return null
    const email = clerk.emailAddresses[0]?.emailAddress
    if (!email) return null
    return prisma.user.upsert({
      where: { clerkId: clerk.id },
      update: { email, name: clerk.fullName ?? email },
      create: {
        clerkId: clerk.id,
        email,
        name: clerk.fullName ?? email.split('@')[0],
      },
    })
  }

  const jar = await cookies()
  const id = jar.get(COOKIE)?.value
  if (!id) return null
  return prisma.user.findUnique({ where: { id } })
}

export async function setSession(userId: string) {
  const jar = await cookies()
  jar.set(COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/' })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}
