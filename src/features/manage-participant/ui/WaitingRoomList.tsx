import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { initialsOf } from '../../../shared/lib/text'
import { useDecideJoinRequestMutation } from '../api/moderation.api'
import type { WaitingRequest } from '../model/waiting-room'

type WaitingRoomListProps = {
  hostParticipantId: string
  requests: WaitingRequest[]
}

/** Host-only: people waiting at the door, with approve / reject. */
export const WaitingRoomList = ({ hostParticipantId, requests }: WaitingRoomListProps) => {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const decide = useDecideJoinRequestMutation()

  const answer = async (requestId: string, approved: boolean) => {
    setFailed(false)
    try {
      await decide.mutateAsync({ approved, hostParticipantId, requestId })
    } catch {
      setFailed(true)
    }
  }

  if (requests.length === 0) return null

  return (
    <section aria-label={t('meetingRoom.waitingRoom')} className="waiting-list">
      <h3>
        {t('meetingRoom.waitingRoom')} <span>{requests.length}</span>
      </h3>
      {requests.map((request) => (
        <div className="waiting-row" key={request.requestId}>
          <span className="waiting-avatar">{initialsOf(request.displayName)}</span>
          <strong>{request.displayName}</strong>
          <button
            aria-label={t('meetingRoom.reject', { name: request.displayName })}
            className="waiting-reject"
            disabled={decide.isPending}
            onClick={() => void answer(request.requestId, false)}
            type="button"
          >
            <X size={16} />
          </button>
          <button
            aria-label={t('meetingRoom.admit', { name: request.displayName })}
            className="waiting-admit"
            disabled={decide.isPending}
            onClick={() => void answer(request.requestId, true)}
            type="button"
          >
            <Check size={16} />
          </button>
        </div>
      ))}
      {failed && (
        <p className="form-error" role="alert">
          {t('meetingRoom.decisionFailed')}
        </p>
      )}
    </section>
  )
}
