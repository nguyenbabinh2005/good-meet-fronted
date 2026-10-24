import { useAppDispatch } from '../../../app/store'
import { meetingSessionRoomChanged } from '../../../entities/meeting/model/meeting-session.slice'
import type { MediaRoomChange } from '../../../entities/meeting/model/types'
import { useRealtimeSubscription } from '../../../shared/realtime'

export const useRoomChanges = (participantId: string) => {
  const dispatch = useAppDispatch()

  useRealtimeSubscription<MediaRoomChange>(`/topic/participants/${participantId}/room`, (change) => {
    dispatch(meetingSessionRoomChanged(change))
  })
}
