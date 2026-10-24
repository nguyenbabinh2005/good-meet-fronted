import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addInvitation,
  cancelMeeting,
  deleteInvitation,
  endMeeting,
  listInvitations,
  rescheduleMeeting,
} from './meeting.api'

const calls: unknown[] = []

vi.mock('../../../shared/api/http-client', () => ({
  httpClient: {
    request: (config: unknown) => {
      calls.push(config)
      return Promise.resolve({ data: undefined, status: 200 })
    },
  },
  participantHeaders: (participantId: string) => ({ 'X-Participant-Id': participantId }),
  userHeaders: (userId: string) => ({ 'X-User-Id': userId }),
}))

describe('meeting API host identification', () => {
  beforeEach(() => {
    calls.length = 0
  })

  it('reschedules with the user id header', async () => {
    await rescheduleMeeting({
      code: 'gm-abcd-efgh',
      scheduledEndAt: '2026-11-01T10:00:00Z',
      scheduledStartAt: '2026-11-01T09:00:00Z',
      userId: 'u1',
    })

    expect(calls).toEqual([
      {
        data: { scheduledEndAt: '2026-11-01T10:00:00Z', scheduledStartAt: '2026-11-01T09:00:00Z' },
        headers: { 'X-User-Id': 'u1' },
        method: 'PUT',
        url: '/meetings/gm-abcd-efgh/schedule',
      },
    ])
  })

  it('cancels with the user id header', async () => {
    await cancelMeeting({ code: 'gm-abcd-efgh', userId: 'u1' })

    expect(calls).toEqual([{ headers: { 'X-User-Id': 'u1' }, method: 'POST', url: '/meetings/gm-abcd-efgh/cancel' }])
  })

  it('lists, adds and removes invitations with the user id header', async () => {
    await listInvitations({ code: 'gm-abcd-efgh', userId: 'u1' })
    await addInvitation({ code: 'gm-abcd-efgh', email: 'an@example.com', userId: 'u1' })
    await deleteInvitation({ code: 'gm-abcd-efgh', invitationId: 'i1', userId: 'u1' })

    expect(calls).toEqual([
      { headers: { 'X-User-Id': 'u1' }, url: '/meetings/gm-abcd-efgh/invitations' },
      {
        data: { email: 'an@example.com' },
        headers: { 'X-User-Id': 'u1' },
        method: 'POST',
        url: '/meetings/gm-abcd-efgh/invitations',
      },
      { headers: { 'X-User-Id': 'u1' }, method: 'DELETE', url: '/meetings/gm-abcd-efgh/invitations/i1' },
    ])
  })

  it('still ends the meeting with the participant id header', async () => {
    await endMeeting({ code: 'gm-abcd-efgh', participantId: 'p1' })

    expect(calls).toEqual([
      { headers: { 'X-Participant-Id': 'p1' }, method: 'POST', url: '/meetings/gm-abcd-efgh/end' },
    ])
  })
})
