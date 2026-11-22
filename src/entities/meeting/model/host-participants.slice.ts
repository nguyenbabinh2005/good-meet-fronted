import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type HostParticipantsState = { byCode: Record<string, string> }

const initialState: HostParticipantsState = { byCode: {} }

const hostParticipantsSlice = createSlice({
  initialState,
  name: 'hostParticipants',
  reducers: {
    hostParticipantRemembered: (state, action: PayloadAction<{ code: string; participantId: string }>) => {
      state.byCode[action.payload.code] = action.payload.participantId
    },
    hostParticipantsCleared: () => initialState,
    hostParticipantsLoaded: (_state, action: PayloadAction<Record<string, string>>) => ({ byCode: action.payload }),
  },
})

export const { hostParticipantRemembered, hostParticipantsCleared, hostParticipantsLoaded } =
  hostParticipantsSlice.actions
export default hostParticipantsSlice.reducer
