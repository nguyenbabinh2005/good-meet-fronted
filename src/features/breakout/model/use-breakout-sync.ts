import { useEffect, useRef } from 'react'
import { useAppDispatch } from '../../../app/store'
import { useRealtimeSubscription } from '../../../shared/realtime'
import { useBreakoutRoomsQuery } from '../api/breakout.api'
import { roomsLoaded } from './breakout.slice'
import type { BreakoutChangedEvent } from './types'

type UseBreakoutSyncOptions = {
  code: string
  enabled: boolean
  hostParticipantId: string
  meetingId: string
}

export const useBreakoutSync = ({ code, enabled, hostParticipantId, meetingId }: UseBreakoutSyncOptions) => {
  const dispatch = useAppDispatch()
  const snapshot = useBreakoutRoomsQuery(code, hostParticipantId, enabled)
  const eventReceived = useRef(false)

  useEffect(() => {
    if (snapshot.data && !eventReceived.current) dispatch(roomsLoaded(snapshot.data))
  }, [dispatch, snapshot.data])

  useRealtimeSubscription<BreakoutChangedEvent>(enabled ? `/topic/meetings/${meetingId}/breakout` : undefined, (event) => {
    eventReceived.current = true
    dispatch(roomsLoaded(event.rooms))
  })
}
