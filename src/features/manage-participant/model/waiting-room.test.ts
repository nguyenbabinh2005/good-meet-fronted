import { describe, expect, it } from 'vitest'
import { applyWaitingRoomEvent, type WaitingRoomEvent } from './waiting-room'

const event = (type: WaitingRoomEvent['type'], requestId: string, displayName = 'An'): WaitingRoomEvent => ({
  displayName,
  requestedAt: '2026-10-20T10:00:00Z',
  requestId,
  type,
})

describe('applyWaitingRoomEvent', () => {
  it('adds a requester', () => {
    expect(applyWaitingRoomEvent([], event('REQUESTED', 'r1'))).toEqual([
      { displayName: 'An', requestedAt: '2026-10-20T10:00:00Z', requestId: 'r1' },
    ])
  })

  it('ignores a duplicate request', () => {
    const once = applyWaitingRoomEvent([], event('REQUESTED', 'r1'))
    expect(applyWaitingRoomEvent(once, event('REQUESTED', 'r1'))).toBe(once)
  })

  it('removes a requester once resolved', () => {
    const list = applyWaitingRoomEvent(applyWaitingRoomEvent([], event('REQUESTED', 'r1')), event('REQUESTED', 'r2', 'Bình'))
    expect(applyWaitingRoomEvent(list, event('RESOLVED', 'r1')).map((request) => request.requestId)).toEqual(['r2'])
  })
})
