import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { initialsOf } from '../../../shared/lib/text'
import { useDecideJoinRequestMutation } from '../api/moderation.api'
import type { WaitingRequest } from '../model/waiting-room'
import styles from './WaitingRoomList.module.scss'

type WaitingRoomListProps = {
  hostParticipantId: string
  requests: WaitingRequest[]
}

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
    <section aria-label={t('meetingRoom.waitingRoom')} className={styles.list}>
      <h3>
        {t('meetingRoom.waitingRoom')} <span>{requests.length}</span>
      </h3>
      {requests.map((request) => (
        <div className={styles.row} key={request.requestId}>
          <span className={styles.avatar}>{initialsOf(request.displayName)}</span>
          <strong>{request.displayName}</strong>
          <button
            aria-label={t('meetingRoom.admit', { name: request.displayName })}
            className={styles.admit}
            disabled={decide.isPending}
            onClick={() => void answer(request.requestId, true)}
            type="button"
          >
            {t('meetingRoom.admitAction')}
          </button>
          <button
            aria-label={t('meetingRoom.reject', { name: request.displayName })}
            className={styles.reject}
            disabled={decide.isPending}
            onClick={() => void answer(request.requestId, false)}
            type="button"
          >
            {t('meetingRoom.rejectAction')}
          </button>
        </div>
      ))}
      {failed && (
        <p className={styles.error} role="alert">
          {t('meetingRoom.decisionFailed')}
        </p>
      )}
    </section>
  )
}
