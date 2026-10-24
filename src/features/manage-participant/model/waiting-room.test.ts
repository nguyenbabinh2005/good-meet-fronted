import { describe, expect, it } from 'vitest'
import { applyWaitingRoomEvent, mergeWaitingSnapshot, type WaitingRoomEvent } from './waiting-room'

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

describe('mergeWaitingSnapshot', () => {
  const request = (requestId: string, requestedAt: string) => ({ displayName: requestId, requestedAt, requestId })

  it('shows people who were already waiting before the host joined', () => {
    const merged = mergeWaitingSnapshot([request('r1', '2026-10-20T10:00:00Z')], [])

    expect(merged.map((item) => item.requestId)).toEqual(['r1'])
  })

  it('keeps requests that arrived live while the snapshot was loading', () => {
    const merged = mergeWaitingSnapshot(
      [request('r1', '2026-10-20T10:00:00Z')],
      [request('r2', '2026-10-20T10:05:00Z'), request('r1', '2026-10-20T10:00:00Z')],
    )

    expect(merged.map((item) => item.requestId)).toEqual(['r1', 'r2'])
  })

  it('orders by the time each person asked to join', () => {
    const merged = mergeWaitingSnapshot(
      [request('late', '2026-10-20T10:09:00Z'), request('early', '2026-10-20T10:01:00Z')],
      [],
    )

    expect(merged.map((item) => item.requestId)).toEqual(['early', 'late'])
  })
})
