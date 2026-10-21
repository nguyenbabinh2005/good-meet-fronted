import { configureStore } from '@reduxjs/toolkit'
import { meetingsLoaded } from '../../entities/meeting/model/my-meetings.slice'
import { readMeetings } from '../../entities/meeting/model/my-meetings-storage'
import { listenerMiddleware } from './listener-middleware'
import { rootReducer } from './root-reducer'

export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  reducer: rootReducer,
})

// A returning visitor is already signed in (identity is restored from localStorage):
// bring their meetings back too.
const restoredUser = store.getState().auth.user
if (restoredUser) store.dispatch(meetingsLoaded(readMeetings(restoredUser.userId)))

export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
export type { RootState } from './root-reducer-types'
