import { useQueryClient } from '@tanstack/react-query'
import { Circle, Copy, Square, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getApiError } from '../../../shared/api/api-error'
import { useCopyFeedback } from '../../../shared/hooks'
import { formatDateTime } from '../../../shared/lib/date-time'
import {
  recordingsQueryKey,
  useRecordingsQuery,
  useStartRecordingMutation,
  useStopRecordingMutation,
} from '../api/recording.api.ts'
import type { Recording } from '../model/types.ts'
import styles from './RecordingPanel.module.scss'

type RecordingPanelProps = { code: string; isHost: boolean; participantId: string }

const formatDuration = (recording: Recording) => {
  if (!recording.endedAt) return ''
  const seconds = Math.max(0, Math.round((Date.parse(recording.endedAt) - Date.parse(recording.startedAt)) / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

type RecordingItemProps = { locale: string; recording: Recording }

const RecordingItem = ({ locale, recording }: RecordingItemProps) => {
  const { t } = useTranslation()
  const { copied, copy } = useCopyFeedback()
  const duration = formatDuration(recording)

  return (
    <article className={styles.item}>
      <header>
        <span className={`${styles.status} ${styles[recording.status]}`}>{t(`recording.status.${recording.status}`)}</span>
        <time dateTime={recording.startedAt}>{formatDateTime(recording.startedAt, locale)}</time>
      </header>
      {duration && <p className={styles.duration}>{t('recording.duration', { duration })}</p>}
      <div className={styles.path}>
        <code>{recording.filePath}</code>
        <button aria-label={t('recording.copyPath')} onClick={() => void copy(recording.filePath)} type="button">
          <Copy size={14} />
          <span>{copied ? t('recording.copied') : t('recording.copyPath')}</span>
        </button>
      </div>
    </article>
  )
}

export const RecordingPanel = ({ code, isHost, participantId }: RecordingPanelProps) => {
  const { i18n, t } = useTranslation()
  const queryClient = useQueryClient()
  const query = useRecordingsQuery(code, participantId)
  const startMutation = useStartRecordingMutation()
  const stopMutation = useStopRecordingMutation()
  const [error, setError] = useState<string>()

  const recordings = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [query.data],
  )
  const active = recordings.some((item) => item.status === 'RECORDING')
  const busy = startMutation.isPending || stopMutation.isPending

  const control = async (action: 'start' | 'stop') => {
    setError(undefined)
    try {
      const input = { code, hostParticipantId: participantId }
      if (action === 'start') await startMutation.mutateAsync(input)
      else await stopMutation.mutateAsync(input)
    } catch (failure) {
      const info = getApiError(failure)
      setError(info?.status === 409 ? t('recording.errors.conflict') : t(`recording.errors.${action}`))
    } finally {
      await queryClient.invalidateQueries({ queryKey: recordingsQueryKey(code, participantId) })
    }
  }

  return (
    <div className={styles.panel}>
      {isHost && (
        <section className={styles.controls}>
          {active ? (
            <button className={styles.stop} disabled={busy} onClick={() => void control('stop')} type="button">
              <Square size={14} />
              {stopMutation.isPending ? t('recording.stopping') : t('recording.stop')}
            </button>
          ) : (
            <button className={styles.start} disabled={busy} onClick={() => void control('start')} type="button">
              <Circle size={14} />
              {startMutation.isPending ? t('recording.starting') : t('recording.start')}
            </button>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </section>
      )}
      <div className={styles.content}>
        {query.isPending && <p className={styles.notice}>{t('recording.loading')}</p>}
        {query.isError && !query.data && <p className={styles.notice}>{t('recording.loadFailed')}</p>}
        {!query.isPending && !query.isError && recordings.length === 0 && (
          <div className={styles.empty}>
            <Video size={28} />
            <strong>{t('recording.emptyTitle')}</strong>
            <span>{t('recording.emptyHint')}</span>
          </div>
        )}
        {recordings.length > 0 && (
          <div className={styles.list}>
            <p className={styles.hint}>{t('recording.storageHint')}</p>
            {recordings.map((recording) => (
              <RecordingItem key={recording.id} locale={i18n.language} recording={recording} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
