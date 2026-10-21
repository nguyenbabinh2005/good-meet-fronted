import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MeetingResponse, Meeting } from './types'

/**
 * The backend cannot list a user's meetings (no GET endpoint), so the meetings this
 * browser created are remembered locally. `participantId` is the host's id in that
 * meeting; it is required in `X-Participant-Id` for every host action.
 */
export type StoredMeeting = Meeting & { participantId?: string }

type MyMeetingsState = { items: StoredMeeting[] }

const initialState: MyMeetingsState = { items: [] }

const myMeetingsSlice = createSlice({
  initialState,
  name: 'myMeetings',
  reducers: {
    /** The host entered the room: remember the participant id; a scheduled meeting is now running. */
    hostJoined: (state, action: PayloadAction<{ participantId: string; publicCode: string }>) => {
      const meeting = state.items.find((item) => item.publicCode === action.payload.publicCode)
      if (!meeting) return
      meeting.participantId = action.payload.participantId
      if (meeting.status === 'SCHEDULED') meeting.status = 'ACTIVE'
    },
    meetingRemoved: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.publicCode !== action.payload)
    },
    meetingSaved: (state, action: PayloadAction<MeetingResponse>) => {
      const index = state.items.findIndex((item) => item.publicCode === action.payload.publicCode)
      if (index === -1) {
        state.items.unshift(action.payload)
        return
      }
      const previous = state.items[index]
      state.items[index] = { ...action.payload, participantId: action.payload.participantId ?? previous.participantId }
    },
    meetingsCleared: () => initialState,
    meetingsLoaded: (_state, action: PayloadAction<StoredMeeting[]>) => ({ items: action.payload }),
  },
})

export const { hostJoined, meetingRemoved, meetingSaved, meetingsCleared, meetingsLoaded } = myMeetingsSlice.actions
export default myMeetingsSlice.reducer
