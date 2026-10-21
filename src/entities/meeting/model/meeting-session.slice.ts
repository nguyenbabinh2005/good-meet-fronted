import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MeetingJoin } from './types'

type MeetingSessionState = {
  /** The room this browser tab is currently in (kept in memory only: LiveKit tokens are short-lived). */
  current?: MeetingJoin
}

const initialState: MeetingSessionState = {}

const meetingSessionSlice = createSlice({
  initialState,
  name: 'meetingSession',
  reducers: {
    meetingSessionCleared: () => initialState,
    meetingSessionEstablished: (state, action: PayloadAction<MeetingJoin>) => {
      state.current = action.payload
    },
  },
})

export const { meetingSessionCleared, meetingSessionEstablished } = meetingSessionSlice.actions
export default meetingSessionSlice.reducer
