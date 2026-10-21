import type { Meeting, MeetingStatus } from './types'

export const isClosed = (status: MeetingStatus) => status === 'ENDED' || status === 'CANCELLED'

/** Upcoming = still joinable (scheduled or running). Past = ended or cancelled. */
export const isUpcoming = (meeting: Pick<Meeting, 'status'>) => !isClosed(meeting.status)

export const meetingLink = (publicCode: string) => `${window.location.origin}/join?code=${encodeURIComponent(publicCode)}`
