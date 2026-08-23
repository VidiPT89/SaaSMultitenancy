import { recordActivity } from '@/lib/activity'
import { currentUser } from '@/lib/auth'
import { canRecordJobOnFree } from '@/lib/plans'
import { membershipFor } from '@/lib/tenant'
import { recordUsage, usageSeries } from '@/lib/usage'
import { NextResponse } from 'next/server'

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })
  if (membership.workspace.plan === 'free') {
    const jobs = await usageSeries(membership.workspaceId, 'jobs')
    const total = jobs.reduce((sum, item) => sum + item.quantity, 0)
    if (!canRecordJobOnFree(total)) return NextResponse.json({ error: 'limit' }, { status: 402 })
  }
  await recordUsage(membership.workspaceId, 'jobs', 1)
  await recordActivity(membership.workspaceId, 'job', `${user.name} registou uso.`, `${user.name} recorded usage.`)
  return NextResponse.json({ ok: true })
}
