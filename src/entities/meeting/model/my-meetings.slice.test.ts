import { describe, expect, it } from 'vitest'
import reducer, { hostJoined, meetingRemoved, meetingSaved, meetingsLoaded } from './my-meetings.slice'
import type { MeetingResponse } from './types'

const meeting = (overrides: Partial<MeetingResponse> = {}): MeetingResponse => ({
  assistantEnabled: false,
  captionsEnabled: false,
  id: 'm1',
  mediaRoomId: 'meeting-m1',
  notesEnabled: false,
  publicCode: 'gm-abcd-efgh',
  scheduledEndAt: '2026-11-01T10:00:00Z',
  scheduledStartAt: '2026-11-01T09:00:00Z',
  status: 'SCHEDULED',
  title: 'Sprint review',
  ...overrides,
})

describe('my meetings state', () => {
  it('adds a new meeting at the top', () => {
    const state = reducer(reducer(undefined, meetingSaved(meeting())), meetingSaved(meeting({ publicCode: 'gm-zzzz-yyyy' })))
    expect(state.items.map((item) => item.publicCode)).toEqual(['gm-zzzz-yyyy', 'gm-abcd-efgh'])
  })

  it('updates in place and keeps the known host participant id', () => {
    let state = reducer(undefined, meetingSaved(meeting()))
    state = reducer(state, hostJoined({ participantId: 'p1', publicCode: 'gm-abcd-efgh' }))
    state = reducer(state, meetingSaved(meeting({ title: 'Renamed', status: 'ENDED' })))

    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({ participantId: 'p1', status: 'ENDED', title: 'Renamed' })
  })

  it('takes a participant id returned with the create response', () => {
    const state = reducer(undefined, meetingSaved(meeting({ participantId: 'p9' })))
    expect(state.items[0].participantId).toBe('p9')
  })

  it('marks a scheduled meeting active once its host joins', () => {
    const state = reducer(
      reducer(undefined, meetingSaved(meeting())),
      hostJoined({ participantId: 'p1', publicCode: 'gm-abcd-efgh' }),
    )
    expect(state.items[0]).toMatchObject({ participantId: 'p1', status: 'ACTIVE' })
  })

  it('does not reopen an ended meeting when the host id is recorded', () => {
    const state = reducer(
      reducer(undefined, meetingSaved(meeting({ status: 'ENDED' }))),
      hostJoined({ participantId: 'p1', publicCode: 'gm-abcd-efgh' }),
    )
    expect(state.items[0].status).toBe('ENDED')
  })

  it('loads and removes meetings', () => {
    const loaded = reducer(undefined, meetingsLoaded([meeting()]))
    expect(reducer(loaded, meetingRemoved('gm-abcd-efgh')).items).toEqual([])
  })
})
