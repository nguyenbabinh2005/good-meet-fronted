import { describe, expect, it } from 'vitest'
import type { StoredMeeting } from '../../../entities/meeting/model/my-meetings.slice'
import { filterMeetings } from './filter-meetings'

const meeting = (publicCode: string, status: StoredMeeting['status'], start: string | null = null): StoredMeeting => ({
  assistantEnabled: false,
  captionsEnabled: false,
  id: publicCode,
  mediaRoomId: `room-${publicCode}`,
  notesEnabled: false,
  publicCode,
  scheduledEndAt: null,
  scheduledStartAt: start,
  status,
  title: publicCode,
})

describe('filterMeetings', () => {
  const all = [
    meeting('later', 'SCHEDULED', '2026-11-01T09:00:00Z'),
    meeting('running', 'ACTIVE'),
    meeting('soon', 'SCHEDULED', '2026-10-25T09:00:00Z'),
    meeting('done', 'ENDED', '2026-10-01T09:00:00Z'),
    meeting('cancelled', 'CANCELLED', '2026-10-10T09:00:00Z'),
  ]

  it('lists running then soonest meetings as upcoming', () => {
    expect(filterMeetings(all, 'UPCOMING').map((item) => item.publicCode)).toEqual(['running', 'soon', 'later'])
  })

  it('lists ended and cancelled meetings as past, newest first', () => {
    expect(filterMeetings(all, 'PAST').map((item) => item.publicCode)).toEqual(['cancelled', 'done'])
  })
})
