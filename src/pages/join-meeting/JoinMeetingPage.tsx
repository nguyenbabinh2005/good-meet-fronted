import { Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { JoinMeetingForm } from '../../features/join-meeting'

const JoinMeetingPage = () => {
  const { t } = useTranslation()
  const [params] = useSearchParams()

  return (
    <section className="join-page">
      <div className="room-card">
        <div className="room-card-heading">
          <span className="room-card-icon">
            <Video size={22} />
          </span>
          <div>
            <p className="eyebrow">{t('homeLobby.roomEyebrow')}</p>
            <h1>{t('joinMeeting.title')}</h1>
            <p>{t('homeLobby.roomDescription')}</p>
          </div>
        </div>
        <JoinMeetingForm defaultCode={params.get('code') ?? ''} />
      </div>
    </section>
  )
}

export default JoinMeetingPage
