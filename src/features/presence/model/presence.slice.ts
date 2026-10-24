import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { meetingSessionCleared } from '../../../entities/meeting/model/meeting-session.slice'
import type { RaisedHand } from './types'

type PresenceState = {
  raised: RaisedHand[]
}

const initialState: PresenceState = { raised: [] }

const presenceSlice = createSlice({
  extraReducers: (builder) => {
    builder.addCase(meetingSessionCleared, () => initialState)
  },
  initialState,
  name: 'presence',
  reducers: {
    handsChanged: (state, action: PayloadAction<RaisedHand[]>) => {
      state.raised = action.payload
    },
  },
})

export const { handsChanged } = presenceSlice.actions
export default presenceSlice.reducer
