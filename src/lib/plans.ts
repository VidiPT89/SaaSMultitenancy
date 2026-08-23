export const FREE_MEMBER_LIMIT = 3
export const FREE_SEAT_METRIC = 'seats'
export const JOB_METRIC = 'jobs'
export const INVITE_METRIC = 'invites'

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function canInviteOnFree(memberCount: number): boolean {
  return memberCount < FREE_MEMBER_LIMIT
}
