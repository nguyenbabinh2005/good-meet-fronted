import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import {
  hostJoined,
  meetingRemoved,
  meetingSaved,
  meetingsCleared,
  meetingsLoaded,
} from '../../entities/meeting/model/my-meetings.slice'
import { readMeetings, writeMeetings } from '../../entities/meeting/model/my-meetings-storage'
import { writeStoredUser } from '../../features/authentication/model/auth-storage'
import { displayNameChanged, signedIn, signedOut } from '../../features/authentication/model/auth.slice'
import { queryClient } from '../providers/query-client'
import type { RootState } from './root-reducer-types'

export const listenerMiddleware = createListenerMiddleware()
const startListening = listenerMiddleware.startListening.withTypes<RootState>()

// Persist the signed-in identity (the backend has no session of its own).
startListening({
  effect: (_action, api) => writeStoredUser(api.getState().auth.user),
  matcher: isAnyOf(signedIn, signedOut, displayNameChanged),
})

// Each user sees only the meetings they created on this browser.
startListening({
  actionCreator: signedIn,
  effect: (action, api) => {
    api.dispatch(meetingsLoaded(readMeetings(action.payload.userId)))
  },
})

startListening({
  actionCreator: signedOut,
  effect: (_action, api) => {
    queryClient.clear()
    api.dispatch(meetingsCleared())
  },
})

startListening({
  effect: (_action, api) => {
    const { auth, myMeetings } = api.getState()
    if (auth.user) writeMeetings(auth.user.userId, myMeetings.items)
  },
  matcher: isAnyOf(meetingSaved, meetingRemoved, hostJoined),
})
