import { currentUser } from '@/lib/auth'
import { clerkEnabled } from '@/lib/clerk'
import { membershipFor } from '@/lib/tenant'
import { usageSeries } from '@/lib/usage'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })

  const [jobs, invites] = await Promise.all([
    usageSeries(membership.workspaceId, 'jobs'),
    usageSeries(membership.workspaceId, 'invites'),
  ])

  return NextResponse.json({
    clerk: clerkEnabled(),
    slug: membership.workspace.slug,
    name: membership.workspace.name,
    nameEn: membership.workspace.nameEn,
    plan: membership.workspace.plan,
    role: membership.role,
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
    billing: membership.workspace.billing.map((item) => ({
      id: item.id,
      kind: item.kind,
      createdAt: item.createdAt.toISOString(),
    })),
    usage: {
      jobs,
      invites,
      seats: membership.workspace.members.length,
    },
  })
}
