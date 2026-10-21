import { CalendarClock, Hash, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { StoredMeeting } from '../../../entities/meeting/model/my-meetings.slice'
import { formatDateTime } from '../../../shared/lib/date-time'

type MeetingListProps = {
  emptyLabel: string
  meetings: StoredMeeting[]
}

export const MeetingList = ({ emptyLabel, meetings }: MeetingListProps) => {
  const { i18n, t } = useTranslation()

  if (meetings.length === 0) return <p className="meeting-list-empty">{emptyLabel}</p>

  return (
    <ul className="meeting-list">
      {meetings.map((meeting) => (
        <li className="meeting-list-row" key={meeting.publicCode}>
          <span className="available-room-hash">{meeting.status === 'ACTIVE' ? <Radio size={16} /> : <Hash size={16} />}</span>
          <div className="meeting-list-copy">
            <strong>{meeting.title}</strong>
            <span>
              {meeting.scheduledStartAt ? (
                <>
                  <CalendarClock size={13} /> {formatDateTime(meeting.scheduledStartAt, i18n.language)}
                </>
              ) : (
                meeting.publicCode
              )}
            </span>
          </div>
          <span className={`status-badge status-${meeting.status.toLowerCase()}`}>{t(`meetingStatus.${meeting.status}`)}</span>
          <Link className="meeting-list-link" to={`/meeting-details/${encodeURIComponent(meeting.publicCode)}`}>
            {t('meetings.details')}
          </Link>
        </li>
      ))}
    </ul>
  )
}
