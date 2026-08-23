export type Role = 'admin' | 'member'
export type Plan = 'free' | 'paid'

export type PublicUser = {
  id: string
  email: string
  name: string
}

export type WorkspaceCard = {
  slug: string
  name: string
  nameEn: string
  plan: string
  role: string
  members: number
}

export type UsageBar = { day: string; quantity: number }

export type DeskPayload = {
  user: PublicUser | null
  demoUsers: PublicUser[]
  clerk: boolean
  workspaces: WorkspaceCard[]
  inbox: { token: string; email: string; name: string; nameEn: string }[]
}

export type WorkspacePayload = {
  slug: string
  name: string
  nameEn: string
  plan: string
  role: string
  me: string
  members: { id: string; name: string; email: string; role: string }[]
  invites: { id: string; email: string; role: string; token: string }[]
  notes: { id: string; title: string; titleEn: string; body: string; bodyEn: string }[]
  activity: { id: string; kind: string; message: string; messageEn: string; createdAt: string }[]
  billing: { id: string; kind: string; createdAt: string }[]
  usage: { jobs: UsageBar[]; invites: UsageBar[]; seats: number; jobTotal: number; noteLimit: number }
  clerk: boolean
}
