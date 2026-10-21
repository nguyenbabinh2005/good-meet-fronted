import { isUpcoming } from '../../../entities/meeting/model/meeting-status'
import type { StoredMeeting } from '../../../entities/meeting/model/my-meetings.slice'

export type MeetingListFilter = 'UPCOMING' | 'PAST'

const startOf = (meeting: StoredMeeting) => (meeting.scheduledStartAt ? Date.parse(meeting.scheduledStartAt) : 0)

/** Upcoming: running meetings first, then by start time. Past: most recent first. */
export const filterMeetings = (meetings: StoredMeeting[], filter: MeetingListFilter) => {
  if (filter === 'UPCOMING') {
    return meetings.filter(isUpcoming).sort((a, b) => startOf(a) - startOf(b))
  }
  return meetings.filter((meeting) => !isUpcoming(meeting)).sort((a, b) => startOf(b) - startOf(a))
}
