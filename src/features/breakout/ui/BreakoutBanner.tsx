import { DoorOpen, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../../app/store'
import { useReturnParticipantMutation } from '../api/breakout.api.ts'
import styles from './BreakoutBanner.module.scss'

type BreakoutBannerProps = {
  code: string
  participantId: string
}

export const BreakoutBanner = ({ code, participantId }: BreakoutBannerProps) => {
  const { t } = useTranslation()
  const breakout = useAppSelector((state) => state.meetingSession.breakout)
  const returnMutation = useReturnParticipantMutation()
  const [failed, setFailed] = useState(false)

  if (!breakout) return null

  const returnToMain = async () => {
    setFailed(false)
    try {
      await returnMutation.mutateAsync({ callerParticipantId: participantId, code, participantId, roomId: breakout.id })
    } catch {
      setFailed(true)
    }
  }

  return (
    <div className={styles.banner} role="status">
      <DoorOpen aria-hidden="true" size={16} />
      <span>{t('breakout.youAreIn', { name: breakout.name })}</span>
      <button disabled={returnMutation.isPending} onClick={() => void returnToMain()} type="button">
        <Undo2 aria-hidden="true" size={14} />
        {t('breakout.backToMain')}
      </button>
      {failed && <em>{t('breakout.errors.generic')}</em>}
    </div>
  )
}
