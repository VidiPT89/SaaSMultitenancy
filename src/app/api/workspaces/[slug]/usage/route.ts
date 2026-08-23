import { currentUser } from '@/lib/auth'
import { membershipFor } from '@/lib/tenant'
import { recordUsage } from '@/lib/usage'
import { NextResponse } from 'next/server'

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })
  await recordUsage(membership.workspaceId, 'jobs', 1)
  return NextResponse.json({ ok: true })
}
