import { Mic, MicOff, UserX } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ParticipantsPanel.module.scss'

/** What the panel needs to know about each person (the page maps LiveKit data into this). */
export type PanelParticipant = {
  id: string
  initials: string
  isLocal: boolean
  kind: 'guest' | 'host' | 'member'
  microphoneSid?: string
  muted: boolean
  name: string
  avatarColor: string
}

type ParticipantsPanelProps = {
  /** Host-only content shown above the list (e.g. the waiting room). */
  children?: ReactNode
  isHost: boolean
  onKick: (participant: PanelParticipant) => void
  onMute: (participant: PanelParticipant) => void
  participants: PanelParticipant[]
}

export const ParticipantsPanel = ({ children, isHost, onKick, onMute, participants }: ParticipantsPanelProps) => {
  const { t } = useTranslation()

  return (
    <div className={styles.panel}>
      {children}
      <div className={styles.participantList}>
        {participants.map((participant) => {
          const canModerate = isHost && !participant.isLocal && participant.kind !== 'host'
          return (
            <div className={styles.participantRow} key={participant.id}>
              <span className={styles.smallAvatar} style={{ '--avatar-color': participant.avatarColor } as CSSProperties}>
                {participant.initials}
              </span>
              <div>
                <strong>
                  {participant.name}
                  {participant.isLocal && ` · ${t('meetingRoom.you')}`}
                </strong>
                <span>{t(`meetingRoom.kinds.${participant.kind}`)}</span>
              </div>
              <div className={styles.rowActions}>
                {canModerate && participant.microphoneSid && !participant.muted && (
                  <button
                    aria-label={t('meetingRoom.muteParticipant', { name: participant.name })}
                    onClick={() => onMute(participant)}
                    type="button"
                  >
                    <MicOff size={15} />
                  </button>
                )}
                {canModerate && (
                  <button
                    aria-label={t('meetingRoom.kickParticipant', { name: participant.name })}
                    className={styles.danger}
                    onClick={() => onKick(participant)}
                    type="button"
                  >
                    <UserX size={15} />
                  </button>
                )}
                <span aria-hidden="true" className={styles.micState}>
                  {participant.muted ? <MicOff size={16} /> : <Mic size={16} />}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
