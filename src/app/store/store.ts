import { configureStore } from '@reduxjs/toolkit'
import { hostParticipantsLoaded } from '../../entities/meeting/model/host-participants.slice'
import { readHostParticipants } from '../../entities/meeting/model/host-participants-storage'
import { listenerMiddleware } from './listener-middleware'
import { rootReducer } from './root-reducer'

export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  reducer: rootReducer,
})

const restoredUser = store.getState().auth.user
if (restoredUser) store.dispatch(hostParticipantsLoaded(readHostParticipants(restoredUser.userId)))

export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
export type { RootState } from './root-reducer-types'
