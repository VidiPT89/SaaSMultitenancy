import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { membershipFor } from '@/lib/tenant'
import { NextResponse } from 'next/server'

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { slug } = await params
  const membership = await membershipFor(user, slug)
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'role' }, { status: 403 })
  }

  const stripe = getStripe()
  const price = process.env.STRIPE_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (stripe && price) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl}/app/${slug}?paid=1`,
      cancel_url: `${appUrl}/app/${slug}`,
      customer_email: user.email,
      metadata: { workspaceId: membership.workspaceId },
      subscription_data: { metadata: { workspaceId: membership.workspaceId } },
    })
    return NextResponse.json({ url: session.url })
  }

  await prisma.$transaction([
    prisma.workspace.update({
      where: { id: membership.workspaceId },
      data: { plan: 'paid' },
    }),
    prisma.billingEvent.create({
      data: {
        workspaceId: membership.workspaceId,
        kind: 'checkout.session.completed',
        payload: '{"source":"local"}',
      },
    }),
  ])
  return NextResponse.json({ url: null })
}
