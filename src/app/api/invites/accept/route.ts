import { recordActivity } from '@/lib/activity'
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const body = (await request.json()) as { token?: string }
  const token = body.token?.trim()
  if (!token) return NextResponse.json({ error: 'token' }, { status: 400 })

  const invite = await prisma.invitation.findUnique({ where: { token } })
  if (!invite || invite.acceptedAt) return NextResponse.json({ error: 'invite' }, { status: 404 })
  if (invite.email !== user.email) return NextResponse.json({ error: 'email' }, { status: 403 })

  await prisma.$transaction([
    prisma.membership.upsert({
      where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
      update: { role: invite.role },
      create: { workspaceId: invite.workspaceId, userId: user.id, role: invite.role },
    }),
    prisma.invitation.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ])

  await recordActivity(invite.workspaceId, 'join', `${user.name} entrou na empresa.`, `${user.name} joined the company.`)
  const workspace = await prisma.workspace.findUnique({ where: { id: invite.workspaceId } })
  return NextResponse.json({ slug: workspace?.slug })
}
