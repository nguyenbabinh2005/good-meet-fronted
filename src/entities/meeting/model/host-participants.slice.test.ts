import { describe, expect, it } from 'vitest'
import reducer, {
  hostParticipantRemembered,
  hostParticipantsCleared,
  hostParticipantsLoaded,
} from './host-participants.slice'

describe('host participants state', () => {
  it('remembers the host participant id of a meeting', () => {
    const state = reducer(undefined, hostParticipantRemembered({ code: 'gm-abcd-efgh', participantId: 'p1' }))
    expect(state.byCode).toEqual({ 'gm-abcd-efgh': 'p1' })
  })

  it('replaces the id when the host enters again', () => {
    let state = reducer(undefined, hostParticipantRemembered({ code: 'gm-abcd-efgh', participantId: 'p1' }))
    state = reducer(state, hostParticipantRemembered({ code: 'gm-abcd-efgh', participantId: 'p2' }))
    expect(state.byCode['gm-abcd-efgh']).toBe('p2')
  })

  it('loads stored ids and clears them on sign out', () => {
    const loaded = reducer(undefined, hostParticipantsLoaded({ 'gm-aaaa-bbbb': 'p3' }))
    expect(loaded.byCode).toEqual({ 'gm-aaaa-bbbb': 'p3' })
    expect(reducer(loaded, hostParticipantsCleared()).byCode).toEqual({})
  })
})
