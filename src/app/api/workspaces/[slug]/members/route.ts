import { recordActivity } from '@/lib/activity'
import { currentUser } from '@/lib/auth'
import { isLastAdmin } from '@/lib/plans'
import { prisma } from '@/lib/prisma'
import { membershipFor } from '@/lib/tenant'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'role' }, { status: 403 })
  }
  const body = (await request.json()) as { userId?: string; role?: string }
  if (!body.userId || (body.role !== 'admin' && body.role !== 'member')) {
    return NextResponse.json({ error: 'payload' }, { status: 400 })
  }
  const roster = membership.workspace.members.map((item) => ({ role: item.role, userId: item.userId }))
  if (body.role === 'member' && isLastAdmin(roster, body.userId)) {
    return NextResponse.json({ error: 'last-admin' }, { status: 409 })
  }
  await prisma.membership.update({
    where: { workspaceId_userId: { workspaceId: membership.workspaceId, userId: body.userId } },
    data: { role: body.role },
  })
  await recordActivity(membership.workspaceId, 'role', `${user.name} mudou um papel.`, `${user.name} changed a role.`)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })
  const body = (await request.json()) as { userId?: string }
  const target = body.userId ?? user.id
  const self = target === user.id
  if (!self && membership.role !== 'admin') {
    return NextResponse.json({ error: 'role' }, { status: 403 })
  }
  const roster = membership.workspace.members.map((item) => ({ role: item.role, userId: item.userId }))
  if (isLastAdmin(roster, target)) {
    return NextResponse.json({ error: 'last-admin' }, { status: 409 })
  }
  await prisma.membership.delete({
    where: { workspaceId_userId: { workspaceId: membership.workspaceId, userId: target } },
  })
  await recordActivity(
    membership.workspaceId,
    'leave',
    self ? `${user.name} saiu da empresa.` : `${user.name} removeu um membro.`,
    self ? `${user.name} left the company.` : `${user.name} removed a member.`,
  )
  return NextResponse.json({ ok: true })
}
