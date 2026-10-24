import { describe, expect, it } from 'vitest'
import { meetingSessionCleared } from '../../../entities/meeting/model/meeting-session.slice'
import reducer, { roomClosed, roomCreated, roomsLoaded } from './breakout.slice'

const room = (id: string, name: string, participants: { displayName: string; participantId: string }[] = []) => ({
  id,
  name,
  participants,
})

describe('breakout state', () => {
  it('replaces the rooms with the snapshot sent by the server', () => {
    const state = reducer(
      reducer(undefined, roomsLoaded([room('b1', 'Nhóm 1')])),
      roomsLoaded([room('b1', 'Nhóm 1', [{ displayName: 'An', participantId: 'p1' }]), room('b2', 'Nhóm 2')]),
    )

    expect(state.rooms.map((item) => item.name)).toEqual(['Nhóm 1', 'Nhóm 2'])
    expect(state.rooms[0].participants).toEqual([{ displayName: 'An', participantId: 'p1' }])
  })

  it('adds a freshly created room without duplicating it', () => {
    let state = reducer(undefined, roomCreated(room('b1', 'Nhóm 1')))
    state = reducer(state, roomCreated(room('b1', 'Nhóm 1')))

    expect(state.rooms).toHaveLength(1)
  })

  it('removes a closed room', () => {
    const state = reducer(reducer(undefined, roomsLoaded([room('b1', 'Nhóm 1'), room('b2', 'Nhóm 2')])), roomClosed('b1'))

    expect(state.rooms.map((item) => item.id)).toEqual(['b2'])
  })

  it('resets when the meeting session is cleared', () => {
    const state = reducer(reducer(undefined, roomCreated(room('b1', 'Nhóm 1'))), meetingSessionCleared())

    expect(state).toEqual({ rooms: [] })
  })
})
