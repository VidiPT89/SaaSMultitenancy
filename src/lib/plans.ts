export const FREE_MEMBER_LIMIT = 3
export const FREE_NOTE_LIMIT = 8
export const FREE_SEAT_METRIC = 'seats'
export const JOB_METRIC = 'jobs'
export const INVITE_METRIC = 'invites'

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function canInviteOnFree(memberCount: number): boolean {
  return memberCount < FREE_MEMBER_LIMIT
}

export function canAddNoteOnFree(noteCount: number): boolean {
  return noteCount < FREE_NOTE_LIMIT
}

export function isLastAdmin(members: { role: string; userId: string }[], userId: string) {
  const admins = members.filter((item) => item.role === 'admin')
  return admins.length === 1 && admins[0]?.userId === userId
}
