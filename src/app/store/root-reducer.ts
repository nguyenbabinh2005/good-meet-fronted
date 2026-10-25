import { combineReducers } from '@reduxjs/toolkit'
import meetingSessionReducer from '../../entities/meeting/model/meeting-session.slice'
import myMeetingsReducer from '../../entities/meeting/model/my-meetings.slice'
import assistantReducer from '../../features/assistant/model/assistant.slice'
import authReducer from '../../features/authentication/model/auth.slice'
import breakoutReducer from '../../features/breakout/model/breakout.slice'
import joinRequestReducer from '../../features/join-meeting/model/join-request.slice'
import meetingRoomUiReducer from '../../features/meeting-room/model/meeting-room-ui.slice'
import presenceReducer from '../../features/presence/model/presence.slice'
import notesReducer from '../../features/transcript/model/notes.slice'

export const rootReducer = combineReducers({
  assistant: assistantReducer,
  auth: authReducer,
  breakout: breakoutReducer,
  joinRequest: joinRequestReducer,
  meetingRoomUi: meetingRoomUiReducer,
  meetingSession: meetingSessionReducer,
  myMeetings: myMeetingsReducer,
  notes: notesReducer,
  presence: presenceReducer,
})
