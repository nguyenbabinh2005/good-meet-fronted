import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../../app/store'
import { useLowerHandMutation, useSetHandMutation } from '../api/presence.api'
import styles from './RaisedHandsList.module.scss'

type RaisedHandsListProps = {
  code: string
  isHost: boolean
  participantId: string
}

export const RaisedHandsList = ({ code, isHost, participantId }: RaisedHandsListProps) => {
  const { t } = useTranslation()
  const raised = useAppSelector((state) => state.presence.raised)
  const setHandMutation = useSetHandMutation()
  const lowerMutation = useLowerHandMutation()

  if (raised.length === 0) return null

  const lower = (targetParticipantId: string) => {
    if (targetParticipantId === participantId) {
      setHandMutation.mutate({ code, participantId, raised: false })
      return
    }
    lowerMutation.mutate({ code, hostParticipantId: participantId, targetParticipantId })
  }

  return (
    <section aria-label={t('presence.raisedHands')} className={styles.list}>
      <h3>
        {t('presence.raisedHands')} <span>{raised.length}</span>
      </h3>
      <ol>
        {raised.map((hand, index) => {
          const own = hand.participantId === participantId
          return (
            <li key={hand.participantId}>
              <span className={styles.position}>{index + 1}</span>
              <strong>{own ? `${hand.displayName} · ${t('meetingRoom.you')}` : hand.displayName}</strong>
              {(isHost || own) && (
                <button
                  aria-label={t('presence.lowerHandOf', { name: hand.displayName })}
                  onClick={() => lower(hand.participantId)}
                  type="button"
                >
                  {t('presence.lower')}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
