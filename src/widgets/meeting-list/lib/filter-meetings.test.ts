import { describe, expect, it } from 'vitest'
import type { MyMeeting } from '../../../entities/meeting/model/types'
import { filterMeetings } from './filter-meetings'

const meeting = (publicCode: string, status: MyMeeting['status'], start: string | null = null): MyMeeting => ({
  createdAt: '2026-10-01T00:00:00Z',
  publicCode,
  relation: 'HOST',
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
