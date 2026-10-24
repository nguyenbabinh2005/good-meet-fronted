import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lowerHand, sendReaction, setHand } from './presence.api.ts'

const calls: unknown[] = []

vi.mock('../../../shared/api/http-client', () => ({
  httpClient: {
    request: (config: unknown) => {
      calls.push(config)
      return Promise.resolve({ data: undefined, status: 204 })
    },
  },
  participantHeaders: (participantId: string) => ({ 'X-Participant-Id': participantId }),
}))

describe('presence API', () => {
  beforeEach(() => {
    calls.length = 0
  })

  it('raises or lowers the own hand with a PUT', async () => {
    await setHand({ code: 'gm-abcd-efgh', participantId: 'p1', raised: true })

    expect(calls).toEqual([
      {
        data: { raised: true },
        headers: { 'X-Participant-Id': 'p1' },
        method: 'PUT',
        url: '/meetings/gm-abcd-efgh/hand',
      },
    ])
  })

  it('lets the host lower the hand of another participant', async () => {
    await lowerHand({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', targetParticipantId: 'p2' })

    expect(calls).toEqual([
      {
        headers: { 'X-Participant-Id': 'h1' },
        method: 'POST',
        url: '/meetings/gm-abcd-efgh/hands/p2/lower',
      },
    ])
  })

  it('sends a reaction', async () => {
    await sendReaction({ code: 'gm-abcd-efgh', emoji: '👏', participantId: 'p1' })

    expect(calls).toEqual([
      {
        data: { emoji: '👏' },
        headers: { 'X-Participant-Id': 'p1' },
        method: 'POST',
        url: '/meetings/gm-abcd-efgh/reactions',
      },
    ])
  })
})
