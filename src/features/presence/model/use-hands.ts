import { useEffect, useRef } from 'react'
import { useAppDispatch } from '../../../app/store'
import { useRealtimeSubscription } from '../../../shared/realtime'
import { useHandsQuery } from '../api/presence.api'
import { handsChanged } from './presence.slice'
import type { HandsChangedEvent } from './types'

type UseHandsOptions = {
  code: string
  meetingId: string
  participantId: string
}

export const useHands = ({ code, meetingId, participantId }: UseHandsOptions) => {
  const dispatch = useAppDispatch()
  const snapshot = useHandsQuery(code, participantId)
  const eventReceived = useRef(false)

  useEffect(() => {
    if (snapshot.data && !eventReceived.current) dispatch(handsChanged(snapshot.data.raisedParticipants))
  }, [dispatch, snapshot.data])

  useRealtimeSubscription<HandsChangedEvent>(`/topic/meetings/${meetingId}/hands`, (event) => {
    eventReceived.current = true
    dispatch(handsChanged(event.raisedParticipants))
  })
}
