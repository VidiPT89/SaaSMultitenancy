import { currentUser } from '@/lib/auth'
import { canInviteOnFree } from '@/lib/plans'
import { prisma } from '@/lib/prisma'
import { membershipFor } from '@/lib/tenant'
import { recordUsage } from '@/lib/usage'
import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'role' }, { status: 403 })
  }

  const body = (await request.json()) as { email?: string; role?: string }
  const email = body.email?.trim().toLowerCase()
  const role = body.role === 'admin' ? 'admin' : 'member'
  if (!email) return NextResponse.json({ error: 'email' }, { status: 400 })

  if (membership.workspace.plan === 'free' && !canInviteOnFree(membership.workspace.members.length)) {
    return NextResponse.json({ error: 'limit' }, { status: 402 })
  }

  const invite = await prisma.invitation.create({
    data: {
      workspaceId: membership.workspaceId,
      email,
      role,
      token: randomBytes(8).toString('hex'),
      invitedById: user.id,
    },
  })
  await recordUsage(membership.workspaceId, 'invites', 1)
  return NextResponse.json({ id: invite.id, token: invite.token })
}
