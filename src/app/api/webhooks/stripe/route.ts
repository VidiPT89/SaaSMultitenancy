import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

async function applyPlan(workspaceId: string, plan: 'free' | 'paid', kind: string, payload: string) {
  await prisma.$transaction([
    prisma.workspace.update({ where: { id: workspaceId }, data: { plan } }),
    prisma.billingEvent.create({ data: { workspaceId, kind, payload } }),
  ])
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return NextResponse.json({ received: true })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''
  const event = stripe.webhooks.constructEvent(body, signature, secret)
  const payload = JSON.stringify(event.data.object)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const workspaceId = session.metadata?.workspaceId
    if (workspaceId) {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan: 'paid',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
        },
      })
      await prisma.billingEvent.create({
        data: { workspaceId, kind: event.type, payload },
      })
    }
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted' ||
    event.type === 'invoice.paid'
  ) {
    const object = event.data.object as { metadata?: { workspaceId?: string }; status?: string }
    const workspaceId = object.metadata?.workspaceId
    if (workspaceId) {
      const paid = event.type === 'invoice.paid' || object.status === 'active' || object.status === 'trialing'
      await applyPlan(workspaceId, paid && event.type !== 'customer.subscription.deleted' ? 'paid' : 'free', event.type, payload)
    }
  }

  return NextResponse.json({ received: true })
}
