import { CalendarPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ScheduleMeetingForm, useScheduleMeeting } from '../../features/schedule-meeting'

const ScheduleMeetingPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isPending, schedule } = useScheduleMeeting()

  return (
    <section className="join-page">
      <div className="room-card">
        <div className="room-card-heading">
          <span className="room-card-icon">
            <CalendarPlus size={22} />
          </span>
          <div>
            <p className="eyebrow">{t('schedule.eyebrow')}</p>
            <h1>{t('schedule.heading')}</h1>
            <p>{t('schedule.description')}</p>
          </div>
        </div>
        <ScheduleMeetingForm
          onSubmit={async (values) => {
            const meeting = await schedule(values)
            await navigate(`/meeting-details/${encodeURIComponent(meeting.publicCode)}`)
          }}
          pending={isPending}
          submitLabel={t('schedule.submit')}
        />
      </div>
    </section>
  )
}

export default ScheduleMeetingPage
