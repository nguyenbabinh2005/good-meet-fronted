import { describe, expect, it } from 'vitest'
import reducer, { displayNameChanged, signedIn, signedOut } from './auth.slice'

const user = { displayName: 'Billy Nguyen', email: 'billy@example.com', userId: 'user-id' }

describe('authentication state', () => {
  it('starts anonymous when nothing is stored', () => {
    expect(reducer(undefined, { type: 'init' })).toEqual({ status: 'anonymous' })
  })

  it('restores the identity kept in localStorage', () => {
    localStorage.setItem('good-meet.auth', JSON.stringify(user))
    expect(reducer(undefined, { type: 'init' })).toEqual({ status: 'authenticated', user })
  })

  it('stores the signed-in user', () => {
    expect(reducer(undefined, signedIn(user))).toEqual({ status: 'authenticated', user })
  })

  it('updates the display name', () => {
    const state = reducer(reducer(undefined, signedIn(user)), displayNameChanged('Bình'))
    expect(state.user?.displayName).toBe('Bình')
  })

  it('clears the user on sign out', () => {
    expect(reducer(reducer(undefined, signedIn(user)), signedOut())).toEqual({ status: 'anonymous' })
  })
})
