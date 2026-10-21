import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readStoredUser } from './auth-storage'
import type { AuthUser } from './types'

export type AuthState = {
  status: 'anonymous' | 'authenticated'
  user?: AuthUser
}

const createInitialState = (): AuthState => {
  const user = readStoredUser()
  return user ? { status: 'authenticated', user } : { status: 'anonymous' }
}

const authSlice = createSlice({
  initialState: createInitialState,
  name: 'auth',
  reducers: {
    displayNameChanged: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.displayName = action.payload
    },
    signedIn: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.status = 'authenticated'
    },
    signedOut: (state) => {
      state.user = undefined
      state.status = 'anonymous'
    },
  },
})

export const { displayNameChanged, signedIn, signedOut } = authSlice.actions
export default authSlice.reducer
