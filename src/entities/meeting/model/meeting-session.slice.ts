import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BreakoutPlacement, MediaRoomChange, MeetingJoin } from './types'

type MeetingSessionState = {
  breakout?: BreakoutPlacement
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
      state.breakout = undefined
    },
    meetingSessionRoomChanged: (state, action: PayloadAction<MediaRoomChange>) => {
      if (!state.current) return
      const change = action.payload
      state.current.mediaUrl = change.mediaUrl
      state.current.mediaToken = change.mediaToken
      state.current.mediaTokenExpiresAt = change.mediaTokenExpiresAt
      state.breakout =
        change.type === 'BREAKOUT' && change.breakoutRoomId && change.roomName
          ? { id: change.breakoutRoomId, name: change.roomName }
          : undefined
    },
  },
})

export const { meetingSessionCleared, meetingSessionEstablished, meetingSessionRoomChanged } =
  meetingSessionSlice.actions
export default meetingSessionSlice.reducer
