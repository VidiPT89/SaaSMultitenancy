import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hueFor } from '@/lib/hue'
import { slugify } from '@/lib/tenant'
import { recordActivity } from '@/lib/activity'
import { recordUsage } from '@/lib/usage'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const body = (await request.json()) as { name?: string; nameEn?: string }
  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: 'name' }, { status: 400 })
  let slug = slugify(name)
  if (!slug) slug = `firma-${Date.now()}`
  const taken = await prisma.workspace.findUnique({ where: { slug } })
  if (taken) slug = `${slug}-${Date.now().toString().slice(-4)}`

  const workspace = await prisma.workspace.create({
    data: {
      slug,
      name,
      nameEn: body.nameEn?.trim() || name,
      hue: hueFor(slug),
      members: { create: { userId: user.id, role: 'admin' } },
    },
  })
  await recordUsage(workspace.id, 'jobs', 1)
  await recordActivity(workspace.id, 'create', `${user.name} abriu a empresa.`, `${user.name} opened the company.`)
  return NextResponse.json({ slug: workspace.slug })
}
