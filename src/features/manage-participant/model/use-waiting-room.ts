import { useEffect, useState } from 'react'
import { useRealtimeSubscription } from '../../../shared/realtime'
import { useWaitingRequestsQuery } from '../api/moderation.api'
import {
  applyWaitingRoomEvent,
  mergeWaitingSnapshot,
  type WaitingRequest,
  type WaitingRoomEvent,
} from './waiting-room'

type UseWaitingRoomOptions = {
  code: string
  enabled: boolean
  hostParticipantId: string
  meetingId: string
}

export const useWaitingRoom = ({ code, enabled, hostParticipantId, meetingId }: UseWaitingRoomOptions) => {
  const [requests, setRequests] = useState<WaitingRequest[]>([])
  const snapshot = useWaitingRequestsQuery(code, hostParticipantId, enabled)

  useEffect(() => {
    if (snapshot.data) setRequests((current) => mergeWaitingSnapshot(snapshot.data, current))
  }, [snapshot.data])

  useRealtimeSubscription<WaitingRoomEvent>(enabled ? `/topic/meetings/${meetingId}/waiting-room` : undefined, (event) =>
    setRequests((current) => applyWaitingRoomEvent(current, event)),
  )

  return requests
}
