import { combineReducers } from '@reduxjs/toolkit'
import meetingSessionReducer from '../../entities/meeting/model/meeting-session.slice'
import hostParticipantsReducer from '../../entities/meeting/model/host-participants.slice'
import authReducer from '../../features/authentication/model/auth.slice'
import breakoutReducer from '../../features/breakout/model/breakout.slice'
import joinRequestReducer from '../../features/join-meeting/model/join-request.slice'
import meetingRoomUiReducer from '../../features/meeting-room/model/meeting-room-ui.slice'
import presenceReducer from '../../features/presence/model/presence.slice'

export const rootReducer = combineReducers({
  auth: authReducer,
  breakout: breakoutReducer,
  hostParticipants: hostParticipantsReducer,
  joinRequest: joinRequestReducer,
  meetingRoomUi: meetingRoomUiReducer,
  meetingSession: meetingSessionReducer,
  presence: presenceReducer,
})
