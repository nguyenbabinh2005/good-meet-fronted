import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** A request waiting for the host's decision (the backend keeps it in memory until resolved). */
export type PendingJoinRequest = {
  displayName: string
  publicCode: string
  requestId: string
}

type JoinRequestState = { current?: PendingJoinRequest }

const initialState: JoinRequestState = {}

const joinRequestSlice = createSlice({
  initialState,
  name: 'joinRequest',
  reducers: {
    joinRequestCleared: () => initialState,
    joinRequestCreated: (state, action: PayloadAction<PendingJoinRequest>) => {
      state.current = action.payload
    },
  },
})

export const { joinRequestCleared, joinRequestCreated } = joinRequestSlice.actions
export default joinRequestSlice.reducer
