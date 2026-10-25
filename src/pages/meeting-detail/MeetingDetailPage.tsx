import { CalendarClock, Copy, Link2, Play, Power, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { useEndMeetingMutation } from '../../entities/meeting/api/meeting.api'
import { isClosed, meetingLink } from '../../entities/meeting/model/meeting-status'
import { meetingSaved } from '../../entities/meeting/model/my-meetings.slice'
import { useEnterMeeting } from '../../features/join-meeting'
import { InvitationsCard } from '../../features/manage-invitations'
import { ScheduleMeetingForm, useManageSchedule } from '../../features/schedule-meeting'
import { MinutesCard } from '../../features/summary'
import { getApiError } from '../../shared/api/api-error'
import { useCopyFeedback } from '../../shared/hooks'
import { formatDateTime, isoToLocalInput } from '../../shared/lib/date-time'
import { Button } from '../../shared/ui/button'

const MeetingDetailPage = () => {
  const { meetingId = '' } = useParams()
  const code = meetingId.toLowerCase()
  const { i18n, t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const meeting = useAppSelector((state) => state.myMeetings.items.find((item) => item.publicCode === code))
  const { enter, errorKey, isPending: isEntering } = useEnterMeeting()
  const manage = useManageSchedule(code)
  const endMutation = useEndMeetingMutation()
  const codeCopy = useCopyFeedback()
  const linkCopy = useCopyFeedback()
  const [rescheduling, setRescheduling] = useState(false)
  const [actionError, setActionError] = useState<string>()

  if (!meeting) {
    return (
      <section className="page-card">
        <p className="eyebrow">{t('meetingDetail.eyebrow')}</p>
        <h1>{t('meetingDetail.notFoundTitle')}</h1>
        <p className="detail-hint">{t('meetingDetail.notFoundHint')}</p>
        <Link className="room-link-action" to={`/join?code=${encodeURIComponent(code)}`}>
          {t('meetingDetail.joinByCode')}
        </Link>
      </section>
    )
  }

  const { participantId } = meeting
  const closed = isClosed(meeting.status)
  const scheduled = meeting.status === 'SCHEDULED'
  const canManage = Boolean(user) && !closed

  const run = async (action: () => Promise<unknown>, confirmKey?: string) => {
    setActionError(undefined)
    if (confirmKey && !window.confirm(t(confirmKey))) return
    try {
      await action()
    } catch (error) {
      setActionError(getApiError(error)?.message ?? t('meetingDetail.actionFailed'))
    }
  }

  return (
    <section className="detail-page">
      <div className="page-card">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{t('meetingDetail.eyebrow')}</p>
            <h1>{meeting.title}</h1>
          </div>
          <span className={`status-badge status-${meeting.status.toLowerCase()}`}>
            {t(`meetingStatus.${meeting.status}`)}
          </span>
        </div>

        {meeting.scheduledStartAt && meeting.scheduledEndAt && (
          <p className="detail-time">
            <CalendarClock size={16} />
            {formatDateTime(meeting.scheduledStartAt, i18n.language)} → {formatDateTime(meeting.scheduledEndAt, i18n.language)}
          </p>
        )}

        <div className="detail-code">
          <code>{meeting.publicCode}</code>
          <Button onClick={() => void codeCopy.copy(meeting.publicCode)} size="sm" variant="outline">
            <Copy size={15} />
            &nbsp;{codeCopy.copied ? t('meetingDetail.copied') : t('meetingDetail.copyCode')}
          </Button>
          <Button onClick={() => void linkCopy.copy(meetingLink(meeting.publicCode))} size="sm" variant="outline">
            <Link2 size={15} />
            &nbsp;{linkCopy.copied ? t('meetingDetail.copied') : t('meetingDetail.copyLink')}
          </Button>
        </div>

        {!closed && (
          <div className="detail-actions">
            <Button
              disabled={isEntering || !user}
              onClick={() => void enter({ code: meeting.publicCode, displayName: user?.displayName ?? '' })}
            >
              <Play size={16} />
              &nbsp;{scheduled ? t('meetingDetail.start') : t('meetingDetail.enter')}
            </Button>
            {scheduled && canManage && (
              <>
                <Button onClick={() => setRescheduling((open) => !open)} variant="outline">
                  <CalendarClock size={16} />
                  &nbsp;{t('meetingDetail.reschedule')}
                </Button>
                <Button
                  disabled={manage.isCancelling}
                  onClick={() => void run(manage.cancel, 'meetingDetail.confirmCancel')}
                  variant="outline"
                >
                  <XCircle size={16} />
                  &nbsp;{t('meetingDetail.cancel')}
                </Button>
              </>
            )}
            {meeting.status === 'ACTIVE' && participantId && (
              <Button
                disabled={endMutation.isPending}
                onClick={() =>
                  void run(
                    async () => dispatch(meetingSaved(await endMutation.mutateAsync({ code, participantId }))),
                    'meetingDetail.confirmEnd',
                  )
                }
                variant="outline"
              >
                <Power size={16} />
                &nbsp;{t('meetingDetail.end')}
              </Button>
            )}
          </div>
        )}

        {errorKey && (
          <p className="form-error" role="alert">
            {t(errorKey)}
          </p>
        )}
        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        {rescheduling && scheduled && meeting.scheduledStartAt && meeting.scheduledEndAt && (
          <div className="detail-reschedule">
            <ScheduleMeetingForm
              defaultValues={{
                endAt: isoToLocalInput(meeting.scheduledEndAt),
                startAt: isoToLocalInput(meeting.scheduledStartAt),
              }}
              mode="reschedule"
              onCancel={() => setRescheduling(false)}
              onSubmit={async (values) => {
                await manage.reschedule(values)
                setRescheduling(false)
              }}
              pending={manage.isRescheduling}
              submitLabel={t('meetingDetail.saveSchedule')}
            />
          </div>
        )}

      </div>

      {canManage && user && <InvitationsCard code={code} userId={user.userId} />}
      {user && meeting.status !== 'SCHEDULED' && meeting.status !== 'CANCELLED' && (
        <MinutesCard code={code} userId={user.userId} />
      )}
    </section>
  )
}

export default MeetingDetailPage
