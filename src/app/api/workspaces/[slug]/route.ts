import { currentUser } from '@/lib/auth'
import { recordActivity } from '@/lib/activity'
import { clerkEnabled } from '@/lib/clerk'
import { FREE_NOTE_LIMIT } from '@/lib/plans'
import { prisma } from '@/lib/prisma'
import { membershipFor } from '@/lib/tenant'
import { usageSeries } from '@/lib/usage'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })

  const [jobs, invites, notes, activity] = await Promise.all([
    usageSeries(membership.workspaceId, 'jobs'),
    usageSeries(membership.workspaceId, 'invites'),
    prisma.ledgerNote.findMany({
      where: { workspaceId: membership.workspaceId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activity.findMany({
      where: { workspaceId: membership.workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 16,
    }),
  ])

  return NextResponse.json({
    clerk: clerkEnabled(),
    slug: membership.workspace.slug,
    name: membership.workspace.name,
    nameEn: membership.workspace.nameEn,
    plan: membership.workspace.plan,
    role: membership.role,
    me: user.id,
    members: membership.workspace.members.map((item) => ({
      id: item.user.id,
      name: item.user.name,
      email: item.user.email,
      role: item.role,
    })),
    invites: membership.workspace.invites.map((item) => ({
      id: item.id,
      email: item.email,
      role: item.role,
      token: item.token,
    })),
    notes: notes.map((item) => ({
      id: item.id,
      title: item.title,
      titleEn: item.titleEn,
      body: item.body,
      bodyEn: item.bodyEn,
    })),
    activity: activity.map((item) => ({
      id: item.id,
      kind: item.kind,
      message: item.message,
      messageEn: item.messageEn,
      createdAt: item.createdAt.toISOString(),
    })),
    billing: membership.workspace.billing.map((item) => ({
      id: item.id,
      kind: item.kind,
      createdAt: item.createdAt.toISOString(),
    })),
    usage: {
      jobs,
      invites,
      seats: membership.workspace.members.length,
      jobTotal: jobs.reduce((sum, item) => sum + item.quantity, 0),
      noteLimit: membership.workspace.plan === 'paid' ? 999 : FREE_NOTE_LIMIT,
    },
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'role' }, { status: 403 })
  }
  const body = (await request.json()) as { name?: string; nameEn?: string }
  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: 'name' }, { status: 400 })
  await prisma.workspace.update({
    where: { id: membership.workspaceId },
    data: { name, nameEn: body.nameEn?.trim() || name },
  })
  await recordActivity(membership.workspaceId, 'rename', `${user.name} mudou o nome.`, `${user.name} renamed the company.`)
  return NextResponse.json({ ok: true })
}
