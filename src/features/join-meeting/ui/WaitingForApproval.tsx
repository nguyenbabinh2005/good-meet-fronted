import { Hourglass, ShieldX } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { meetingSessionEstablished } from '../../../entities/meeting/model/meeting-session.slice'
import type { MeetingJoin } from '../../../entities/meeting/model/types'
import { useRealtimeSubscription } from '../../../shared/realtime'
import { Button } from '../../../shared/ui/button'
import { joinRequestCleared } from '../model/join-request.slice'

/** Payload of /topic/join-requests/{requestId} (MeetingNotifier.JoinDecision). */
type JoinDecision = { approved: boolean; result: MeetingJoin | null }

export const WaitingForApproval = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const pending = useAppSelector((state) => state.joinRequest.current)
  const [denied, setDenied] = useState(false)
  const admitted = useRef(false)

  useRealtimeSubscription<JoinDecision>(
    pending && !denied ? `/topic/join-requests/${pending.requestId}` : undefined,
    (decision) => {
      if (decision.approved && decision.result) {
        admitted.current = true
        dispatch(meetingSessionEstablished(decision.result))
        dispatch(joinRequestCleared())
        void navigate(`/meetings/${encodeURIComponent(decision.result.publicCode)}`, { replace: true })
        return
      }
      setDenied(true)
    },
  )

  if (!pending) return admitted.current ? null : <Navigate replace to="/join" />

  const leave = () => {
    dispatch(joinRequestCleared())
    void navigate(`/join?code=${encodeURIComponent(pending.publicCode)}`, { replace: true })
  }

  return (
    <div className="waiting-card" role="status">
      <span className={denied ? 'waiting-icon waiting-icon-denied' : 'waiting-icon'}>
        {denied ? <ShieldX size={28} /> : <Hourglass size={28} />}
      </span>
      <h2>{denied ? t('waitingRoom.deniedTitle') : t('waitingRoom.title')}</h2>
      <p>{denied ? t('waitingRoom.deniedDescription') : t('waitingRoom.description', { name: pending.displayName })}</p>
      <code className="waiting-code">{pending.publicCode}</code>
      <Button onClick={leave} variant="outline">
        {denied ? t('waitingRoom.back') : t('waitingRoom.cancel')}
      </Button>
    </div>
  )
}
