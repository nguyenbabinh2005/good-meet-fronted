import { combineReducers } from '@reduxjs/toolkit'
import myMeetingsReducer from '../../entities/meeting/model/my-meetings.slice'
import meetingSessionReducer from '../../entities/meeting/model/meeting-session.slice'
import authReducer from '../../features/authentication/model/auth.slice'
import joinRequestReducer from '../../features/join-meeting/model/join-request.slice'
import meetingRoomUiReducer from '../../features/meeting-room/model/meeting-room-ui.slice'

export const rootReducer = combineReducers({
  auth: authReducer,
  joinRequest: joinRequestReducer,
  meetingRoomUi: meetingRoomUiReducer,
  meetingSession: meetingSessionReducer,
  myMeetings: myMeetingsReducer,
})
