import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import {
  hostParticipantRemembered,
  hostParticipantsCleared,
  hostParticipantsLoaded,
} from '../../entities/meeting/model/host-participants.slice'
import { readHostParticipants, writeHostParticipants } from '../../entities/meeting/model/host-participants-storage'
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

startListening({
  actionCreator: signedIn,
  effect: (action, api) => {
    api.dispatch(hostParticipantsLoaded(readHostParticipants(action.payload.userId)))
  },
})

startListening({
  actionCreator: signedOut,
  effect: (_action, api) => {
    queryClient.clear()
    api.dispatch(hostParticipantsCleared())
  },
})

startListening({
  effect: (_action, api) => {
    const { auth, hostParticipants } = api.getState()
    if (auth.user) writeHostParticipants(auth.user.userId, hostParticipants.byCode)
  },
  actionCreator: hostParticipantRemembered,
})
