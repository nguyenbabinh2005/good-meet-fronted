import { beforeEach, describe, expect, it, vi } from 'vitest'
import { joinMeeting } from './join.api'

const request = vi.fn()
vi.mock('../../../shared/api/http-client', () => ({ httpClient: { request: (config: unknown) => request(config) } }))

const joinResult = {
  displayName: 'An',
  mediaToken: 'jwt',
  mediaTokenExpiresAt: '2026-10-20T10:10:00Z',
  mediaUrl: 'ws://localhost:7880',
  meetingId: 'm1',
  participantId: 'p1',
  publicCode: 'gm-abcd-efgh',
  role: 'HOST',
}

describe('joinMeeting', () => {
  beforeEach(() => request.mockReset())

  it('treats 200 as admitted straight into the room', async () => {
    request.mockResolvedValue({ data: joinResult, status: 200 })

    await expect(joinMeeting({ code: 'gm-abcd-efgh', displayName: 'An', userId: 'u1' })).resolves.toEqual({
      join: joinResult,
      kind: 'joined',
    })
    expect(request).toHaveBeenCalledWith({
      data: { displayName: 'An', userId: 'u1' },
      method: 'POST',
      url: '/meetings/gm-abcd-efgh/join',
    })
  })

  it('treats 202 as waiting for the host to decide', async () => {
    request.mockResolvedValue({ data: { requestId: 'r1' }, status: 202 })

    await expect(joinMeeting({ code: 'gm-abcd-efgh', displayName: 'An' })).resolves.toEqual({
      kind: 'waiting',
      requestId: 'r1',
    })
  })
})
