import { recordActivity } from '@/lib/activity'
import { currentUser } from '@/lib/auth'
import { canAddNoteOnFree } from '@/lib/plans'
import { prisma } from '@/lib/prisma'
import { membershipFor } from '@/lib/tenant'
import { recordUsage } from '@/lib/usage'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })
  const count = await prisma.ledgerNote.count({ where: { workspaceId: membership.workspaceId } })
  if (membership.workspace.plan === 'free' && !canAddNoteOnFree(count)) {
    return NextResponse.json({ error: 'limit' }, { status: 402 })
  }
  const body = (await request.json()) as { title?: string; titleEn?: string; body?: string; bodyEn?: string }
  const title = body.title?.trim()
  if (!title) return NextResponse.json({ error: 'title' }, { status: 400 })
  await prisma.ledgerNote.create({
    data: {
      workspaceId: membership.workspaceId,
      title,
      titleEn: body.titleEn?.trim() || title,
      body: body.body?.trim() || '',
      bodyEn: body.bodyEn?.trim() || body.body?.trim() || '',
    },
  })
  await recordUsage(membership.workspaceId, 'jobs', 1)
  await recordActivity(membership.workspaceId, 'note', `${user.name} escreveu no livro.`, `${user.name} wrote in the ledger.`)
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })
  const body = (await request.json()) as { id?: string; pinned?: boolean }
  if (!body.id) return NextResponse.json({ error: 'id' }, { status: 400 })
  await prisma.ledgerNote.updateMany({
    where: { id: body.id, workspaceId: membership.workspaceId },
    data: { pinned: Boolean(body.pinned) },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership) return NextResponse.json({ error: 'wall' }, { status: 403 })
  const body = (await request.json()) as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'id' }, { status: 400 })
  await prisma.ledgerNote.deleteMany({ where: { id: body.id, workspaceId: membership.workspaceId } })
  await recordActivity(membership.workspaceId, 'note', `${user.name} tirou uma folha.`, `${user.name} pulled a sheet.`)
  return NextResponse.json({ ok: true })
}
