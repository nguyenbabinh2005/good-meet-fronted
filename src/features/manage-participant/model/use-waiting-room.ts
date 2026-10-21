import { useState } from 'react'
import { useRealtimeSubscription } from '../../../shared/realtime'
import { applyWaitingRoomEvent, type WaitingRequest, type WaitingRoomEvent } from './waiting-room'

/**
 * Host-only. Mounted for the whole time the host is in the room (not only while a
 * panel is open) so no request is missed; pass `enabled=false` for non-hosts.
 */
export const useWaitingRoom = (meetingId: string, enabled: boolean) => {
  const [requests, setRequests] = useState<WaitingRequest[]>([])

  useRealtimeSubscription<WaitingRoomEvent>(enabled ? `/topic/meetings/${meetingId}/waiting-room` : undefined, (event) =>
    setRequests((current) => applyWaitingRoomEvent(current, event)),
  )

  return requests
}
