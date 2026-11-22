import { Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '../../../shared/lib/date-time'
import { useMinutesHistoryQuery } from '../api/minutes.api'
import styles from './MinutesView.module.scss'

type MinutesViewProps = { code: string; userId: string }

type SectionProps = { items: string[]; title: string }

const Section = ({ items, title }: SectionProps) => {
  if (items.length === 0) return null
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export const MinutesView = ({ code, userId }: MinutesViewProps) => {
  const { i18n, t } = useTranslation()
  const query = useMinutesHistoryQuery(code, userId)
  const [selectedId, setSelectedId] = useState<string>()

  const sessions = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [query.data],
  )
  const current = sessions.find((item) => item.id === selectedId) ?? sessions[0]

  return (
    <div className={styles.view}>
      {sessions.length > 1 && (
        <div className={styles.toolbar}>
          <select
            aria-label={t('minutes.session')}
            onChange={(event) => setSelectedId(event.target.value)}
            value={current?.id}
          >
            {sessions.map((item) => (
              <option key={item.id} value={item.id}>
                {formatDateTime(item.createdAt, i18n.language)}
              </option>
            ))}
          </select>
        </div>
      )}

      {query.isPending && <p className={styles.notice}>{t('minutes.loading')}</p>}
      {query.isError && !query.data && <p className={styles.notice}>{t('minutes.loadFailed')}</p>}

      {!query.isPending && !current && !query.isError && (
        <div className={styles.empty}>
          <Sparkles size={28} />
          <strong>{t('minutes.emptyTitle')}</strong>
          <span>{t('minutes.emptyHint')}</span>
        </div>
      )}

      {current && (
        <article className={styles.minutes}>
          <header>
            <span className={`${styles.status} ${styles[current.status]}`}>{t(`minutes.status.${current.status}`)}</span>
            <time dateTime={current.createdAt}>{formatDateTime(current.createdAt, i18n.language)}</time>
          </header>

          {current.status === 'GENERATING' && <p className={styles.notice}>{t('minutes.generatingHint')}</p>}

          {current.status === 'FAILED' && (
            <p className={styles.error}>{current.errorMessage ?? t('minutes.errors.generic')}</p>
          )}

          {current.status === 'COMPLETED' && (
            <>
              {current.summaryText && (
                <section className={styles.section}>
                  <h3>{t('minutes.summary')}</h3>
                  <p>{current.summaryText}</p>
                </section>
              )}
              <Section items={current.discussionPoints} title={t('minutes.discussionPoints')} />
              <Section items={current.decisions} title={t('minutes.decisions')} />
              {current.actionItems.length > 0 && (
                <section className={styles.section}>
                  <h3>{t('minutes.actionItems')}</h3>
                  <ul>
                    {current.actionItems.map((item, index) => (
                      <li key={`${index}-${item.task}`}>
                        <span>{item.task}</span>
                        <small>
                          {item.assignee ?? t('minutes.unassigned')}
                          {item.deadline ? ` · ${item.deadline}` : ''}
                        </small>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </article>
      )}
    </div>
  )
}
