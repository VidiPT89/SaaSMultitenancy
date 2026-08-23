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
}

export type WorkspacePayload = {
  slug: string
  name: string
  nameEn: string
  plan: string
  role: string
  members: { id: string; name: string; email: string; role: string }[]
  invites: { id: string; email: string; role: string; token: string }[]
  billing: { id: string; kind: string; createdAt: string }[]
  usage: { jobs: UsageBar[]; invites: UsageBar[]; seats: number }
  clerk: boolean
}
