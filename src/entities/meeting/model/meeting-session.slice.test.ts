import { describe, expect, it } from 'vitest'
import reducer, {
  meetingSessionCleared,
  meetingSessionEstablished,
  meetingSessionRoomChanged,
} from './meeting-session.slice'
import type { MediaRoomChange, MeetingJoin } from './types'

const join: MeetingJoin = {
  displayName: 'An',
  mediaToken: 'main-token',
  mediaTokenExpiresAt: '2026-10-20T10:10:00Z',
  mediaUrl: 'ws://localhost:7880',
  meetingId: 'm1',
  participantId: 'p1',
  publicCode: 'gm-abcd-efgh',
  role: 'PARTICIPANT',
}

const toBreakout: MediaRoomChange = {
  breakoutRoomId: 'b1',
  mediaToken: 'breakout-token',
  mediaTokenExpiresAt: '2026-10-20T10:20:00Z',
  mediaUrl: 'ws://localhost:7880',
  roomName: 'Nhóm 1',
  type: 'BREAKOUT',
}

const toMain: MediaRoomChange = {
  breakoutRoomId: null,
  mediaToken: 'main-token-2',
  mediaTokenExpiresAt: '2026-10-20T10:30:00Z',
  mediaUrl: 'ws://localhost:7880',
  roomName: null,
  type: 'MAIN',
}

describe('meeting session state', () => {
  it('moves into a breakout room with the new token', () => {
    const state = reducer(reducer(undefined, meetingSessionEstablished(join)), meetingSessionRoomChanged(toBreakout))

    expect(state.current).toMatchObject({ mediaToken: 'breakout-token', participantId: 'p1' })
    expect(state.breakout).toEqual({ id: 'b1', name: 'Nhóm 1' })
  })

  it('returns to the main room with a fresh token', () => {
    let state = reducer(undefined, meetingSessionEstablished(join))
    state = reducer(state, meetingSessionRoomChanged(toBreakout))
    state = reducer(state, meetingSessionRoomChanged(toMain))

    expect(state.current?.mediaToken).toBe('main-token-2')
    expect(state.breakout).toBeUndefined()
  })

  it('ignores a room change when there is no session', () => {
    expect(reducer(undefined, meetingSessionRoomChanged(toBreakout))).toEqual({})
  })

  it('forgets the breakout placement when a session is established or cleared', () => {
    let state = reducer(reducer(undefined, meetingSessionEstablished(join)), meetingSessionRoomChanged(toBreakout))
    expect(reducer(state, meetingSessionEstablished(join)).breakout).toBeUndefined()
    state = reducer(state, meetingSessionCleared())
    expect(state).toEqual({})
  })
})
