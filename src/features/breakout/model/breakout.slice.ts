import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { meetingSessionCleared } from '../../../entities/meeting/model/meeting-session.slice'
import type { BreakoutRoom } from './types'

type BreakoutState = {
  rooms: BreakoutRoom[]
}

const initialState: BreakoutState = { rooms: [] }

const breakoutSlice = createSlice({
  extraReducers: (builder) => {
    builder.addCase(meetingSessionCleared, () => initialState)
  },
  initialState,
  name: 'breakout',
  reducers: {
    roomClosed: (state, action: PayloadAction<string>) => {
      state.rooms = state.rooms.filter((room) => room.id !== action.payload)
    },
    roomCreated: (state, action: PayloadAction<BreakoutRoom>) => {
      if (!state.rooms.some((room) => room.id === action.payload.id)) state.rooms.push(action.payload)
    },
    roomsLoaded: (state, action: PayloadAction<BreakoutRoom[]>) => {
      state.rooms = action.payload
    },
  },
})

export const { roomClosed, roomCreated, roomsLoaded } = breakoutSlice.actions
export default breakoutSlice.reducer
