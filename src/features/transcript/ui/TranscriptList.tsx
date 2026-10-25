import { FileText } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatTime } from '../../../shared/lib/date-time'
import { useTranscriptsQuery } from '../api/transcript.api.ts'
import styles from './TranscriptList.module.scss'

type TranscriptListProps = { code: string; participantId: string }

export const TranscriptList = ({ code, participantId }: TranscriptListProps) => {
  const { i18n, t } = useTranslation()
  const query = useTranscriptsQuery(code, participantId)
  const endRef = useRef<HTMLDivElement>(null)

  const lines = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.spokenAt.localeCompare(b.spokenAt)),
    [query.data],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [lines.length])

  if (query.isPending) return <p className={styles.notice}>{t('transcript.loading')}</p>
  if (query.isError && !query.data) return <p className={styles.notice}>{t('transcript.loadFailed')}</p>

  if (lines.length === 0) {
    return (
      <div className={styles.empty}>
        <FileText size={28} />
        <strong>{t('transcript.emptyTitle')}</strong>
        <span>{t('transcript.emptyHint')}</span>
      </div>
    )
  }

  let sessionIndex = 0
  let lastSessionId = ''

  return (
    <div aria-live="polite" className={styles.list} role="log">
      {lines.map((line) => {
        const newSession = line.sessionId !== lastSessionId
        if (newSession) {
          sessionIndex += 1
          lastSessionId = line.sessionId
        }
        return (
          <div key={line.id}>
            {newSession && <p className={styles.session}>{t('transcript.session', { index: sessionIndex })}</p>}
            <article className={styles.line}>
              <header>
                <strong>{line.speakerName}</strong>
                <time dateTime={line.spokenAt}>{formatTime(line.spokenAt, i18n.language)}</time>
              </header>
              <p>{line.content}</p>
            </article>
          </div>
        )
      })}
      <div ref={endRef} />
    </div>
  )
}
