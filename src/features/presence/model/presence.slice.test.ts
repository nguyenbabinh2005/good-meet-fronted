import { describe, expect, it } from 'vitest'
import { meetingSessionCleared } from '../../../entities/meeting/model/meeting-session.slice'
import reducer, { handsChanged } from './presence.slice'

const an = { displayName: 'An', participantId: 'p1' }
const binh = { displayName: 'Bình', participantId: 'p2' }

describe('presence state', () => {
  it('keeps the raised hands in the order sent by the server', () => {
    expect(reducer(undefined, handsChanged([binh, an])).raised).toEqual([binh, an])
  })

  it('replaces the previous list on every change', () => {
    const state = reducer(reducer(undefined, handsChanged([an, binh])), handsChanged([binh]))

    expect(state.raised).toEqual([binh])
  })

  it('forgets all hands when the session is cleared', () => {
    const state = reducer(reducer(undefined, handsChanged([an])), meetingSessionCleared())

    expect(state.raised).toEqual([])
  })
})
