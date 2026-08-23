import { clearSession, currentUser, setSession } from '@/lib/auth'
import { clerkEnabled } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await currentUser()
  const demoUsers = clerkEnabled()
    ? []
    : await prisma.user.findMany({ orderBy: { name: 'asc' } })
  const workspaces = user
    ? await prisma.membership.findMany({
        where: { userId: user.id },
        include: { workspace: { include: { _count: { select: { members: true } } } } },
        orderBy: { createdAt: 'asc' },
      })
    : []
  const inbox = user
    ? await prisma.invitation.findMany({
        where: { email: user.email, acceptedAt: null },
        include: { workspace: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return NextResponse.json({
    clerk: clerkEnabled(),
    user: user ? { id: user.id, email: user.email, name: user.name } : null,
    demoUsers: demoUsers.map((item) => ({ id: item.id, email: item.email, name: item.name })),
    workspaces: workspaces.map((item) => ({
      slug: item.workspace.slug,
      name: item.workspace.name,
      nameEn: item.workspace.nameEn,
      plan: item.workspace.plan,
      role: item.role,
      members: item.workspace._count.members,
      hue: item.workspace.hue,
    })),
    inbox: inbox.map((item) => ({
      token: item.token,
      email: item.email,
      name: item.workspace.name,
      nameEn: item.workspace.nameEn,
    })),
  })
}

export async function POST(request: Request) {
  if (clerkEnabled()) return NextResponse.json({ ok: true })
  const body = (await request.json()) as { userId?: string }
  if (!body.userId) return NextResponse.json({ error: 'user' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: body.userId } })
  if (!user) return NextResponse.json({ error: 'missing' }, { status: 404 })
  await setSession(user.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
