import { dayKey } from './plans'
import { prisma } from './prisma'

export async function recordUsage(workspaceId: string, metric: string, quantity = 1) {
  const day = dayKey()
  await prisma.usagePoint.create({
    data: { workspaceId, metric, quantity, day },
  })
}

export async function usageSeries(workspaceId: string, metric: string, days = 14) {
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  const rows = await prisma.usagePoint.findMany({
    where: { workspaceId, metric, createdAt: { gte: start } },
  })
  const map = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    map.set(dayKey(d), 0)
  }
  for (const row of rows) {
    map.set(row.day, (map.get(row.day) ?? 0) + row.quantity)
  }
  return [...map.entries()].map(([day, quantity]) => ({ day, quantity }))
}
