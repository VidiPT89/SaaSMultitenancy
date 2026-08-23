import { PrismaClient } from '@prisma/client'
import { dayKey } from '../src/lib/plans'

const prisma = new PrismaClient()

async function main() {
  await prisma.activity.deleteMany()
  await prisma.ledgerNote.deleteMany()
  await prisma.billingEvent.deleteMany()
  await prisma.usagePoint.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  const david = await prisma.user.create({
    data: { email: 'david@ividi.dev', name: 'David Martins' },
  })
  const ana = await prisma.user.create({
    data: { email: 'ana@atelier.pt', name: 'Ana Rocha' },
  })
  const nuno = await prisma.user.create({
    data: { email: 'nuno@cascais.studio', name: 'Nuno Vale' },
  })
  await prisma.user.create({
    data: { email: 'guest@firma.dev', name: 'Convidado' },
  })

  const ividi = await prisma.workspace.create({
    data: {
      slug: 'ividi',
      name: 'iVidi.dev',
      nameEn: 'iVidi.dev',
      plan: 'paid',
      hue: 'ember',
    },
  })
  const atelier = await prisma.workspace.create({
    data: {
      slug: 'atelier',
      name: 'Atelier Cascais',
      nameEn: 'Cascais Atelier',
      plan: 'free',
      hue: 'amber',
    },
  })
  const norte = await prisma.workspace.create({
    data: {
      slug: 'norte',
      name: 'Estúdio Norte',
      nameEn: 'North Studio',
      plan: 'free',
      hue: 'paper',
    },
  })

  await prisma.membership.createMany({
    data: [
      { workspaceId: ividi.id, userId: david.id, role: 'admin' },
      { workspaceId: ividi.id, userId: ana.id, role: 'member' },
      { workspaceId: atelier.id, userId: ana.id, role: 'admin' },
      { workspaceId: atelier.id, userId: nuno.id, role: 'member' },
      { workspaceId: norte.id, userId: nuno.id, role: 'admin' },
    ],
  })

  await prisma.invitation.create({
    data: {
      workspaceId: atelier.id,
      email: 'guest@firma.dev',
      role: 'member',
      token: 'atelier-guest',
      invitedById: ana.id,
    },
  })

  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const day = dayKey(d)
    await prisma.usagePoint.createMany({
      data: [
        { workspaceId: ividi.id, metric: 'jobs', quantity: 8 + ((i * 3) % 11), day },
        { workspaceId: ividi.id, metric: 'invites', quantity: i % 4 === 0 ? 1 : 0, day },
        { workspaceId: atelier.id, metric: 'jobs', quantity: 2 + (i % 5), day },
        { workspaceId: atelier.id, metric: 'invites', quantity: i === 2 ? 1 : 0, day },
      ],
    })
  }

  await prisma.ledgerNote.createMany({
    data: [
      {
        workspaceId: ividi.id,
        title: 'Briefing do site',
        titleEn: 'Site briefing',
        body: 'Só a iVidi vê esta folha.',
        bodyEn: 'Only iVidi sees this sheet.',
        pinned: true,
      },
      {
        workspaceId: norte.id,
        title: 'Rolo do norte',
        titleEn: 'Northern roll',
        body: 'Esta folha só existe para o Nuno.',
        bodyEn: 'This sheet exists only for Nuno.',
      },
      {
        workspaceId: atelier.id,
        title: 'Revelação da semana',
        titleEn: 'This week\'s development',
        body: 'O Atelier Cascais guarda o quarto escuro.',
        bodyEn: 'Cascais Atelier keeps the darkroom.',
      },
    ],
  })

  await prisma.activity.createMany({
    data: [
      {
        workspaceId: ividi.id,
        kind: 'create',
        message: 'David Martins abriu a empresa.',
        messageEn: 'David Martins opened the company.',
      },
      {
        workspaceId: atelier.id,
        kind: 'invite',
        message: 'Ana Rocha convidou guest@firma.dev.',
        messageEn: 'Ana Rocha invited guest@firma.dev.',
      },
    ],
  })

  await prisma.billingEvent.createMany({
    data: [
      { workspaceId: ividi.id, kind: 'checkout.session.completed', payload: '{"plan":"paid"}' },
      { workspaceId: ividi.id, kind: 'invoice.paid', payload: '{"amount":2900}' },
    ],
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
