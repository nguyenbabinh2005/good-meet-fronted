import { describe, expect, it } from 'vitest'
import { participantIdFromIdentity } from './identity'

describe('participantIdFromIdentity', () => {
  it('reads the participant id of a registered user', () => {
    expect(participantIdFromIdentity('user_9f1c-22')).toBe('9f1c-22')
  })

  it('reads the participant id of a guest', () => {
    expect(participantIdFromIdentity('guest_a7b3-01')).toBe('a7b3-01')
  })

  it('returns nothing for an identity without a prefix', () => {
    expect(participantIdFromIdentity('anonymous')).toBeUndefined()
    expect(participantIdFromIdentity('user_')).toBeUndefined()
  })
})
