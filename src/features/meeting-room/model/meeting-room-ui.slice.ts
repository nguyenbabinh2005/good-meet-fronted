import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type RoomPanel = 'chat' | 'participants' | null

type MeetingRoomUiState = { panel: RoomPanel }

const initialState: MeetingRoomUiState = { panel: null }

const meetingRoomUiSlice = createSlice({
  initialState,
  name: 'meetingRoomUi',
  reducers: {
    panelClosed: (state) => {
      state.panel = null
    },
    panelToggled: (state, action: PayloadAction<Exclude<RoomPanel, null>>) => {
      state.panel = state.panel === action.payload ? null : action.payload
    },
  },
})

export const { panelClosed, panelToggled } = meetingRoomUiSlice.actions
export default meetingRoomUiSlice.reducer
