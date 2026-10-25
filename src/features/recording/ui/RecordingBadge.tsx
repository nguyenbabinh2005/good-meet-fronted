import { useTranslation } from 'react-i18next'
import { useRecordingsQuery } from '../api/recording.api.ts'
import styles from './RecordingBadge.module.scss'

type RecordingBadgeProps = { code: string; participantId: string }

export const RecordingBadge = ({ code, participantId }: RecordingBadgeProps) => {
  const { t } = useTranslation()
  const query = useRecordingsQuery(code, participantId)
  const active = query.data?.some((item) => item.status === 'RECORDING') ?? false

  if (!active) return null

  return (
    <span aria-label={t('recording.live')} className={styles.badge} role="status">
      <i /> {t('recording.rec')}
    </span>
  )
}
