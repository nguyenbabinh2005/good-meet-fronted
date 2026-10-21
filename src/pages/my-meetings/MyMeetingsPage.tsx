import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../app/store'
import { filterMeetings, MeetingList, type MeetingListFilter } from '../../widgets/meeting-list'

const MyMeetingsPage = () => {
  const { t } = useTranslation()
  const meetings = useAppSelector((state) => state.myMeetings.items)
  const [filter, setFilter] = useState<MeetingListFilter>('UPCOMING')
  const visible = filterMeetings([...meetings], filter)

  return (
    <section className="page-card meetings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('meetings.eyebrow')}</p>
          <h1>{t('meetings.title')}</h1>
        </div>
        <Link className="room-link-action" to="/meetings/schedule">
          <CalendarPlus size={17} />
          {t('homeLobby.scheduleRoom')}
        </Link>
      </div>
      <p className="detail-hint">{t('meetings.localHint')}</p>

      <div aria-label={t('meetings.filters')} className="segmented" role="tablist">
        {(['UPCOMING', 'PAST'] as const).map((option) => (
          <button
            aria-selected={filter === option}
            className={filter === option ? 'is-active' : ''}
            key={option}
            onClick={() => setFilter(option)}
            role="tab"
            type="button"
          >
            {t(`meetings.filter.${option}`)}
          </button>
        ))}
      </div>

      <MeetingList emptyLabel={t(`meetings.empty.${filter}`)} meetings={visible} />
    </section>
  )
}

export default MyMeetingsPage
