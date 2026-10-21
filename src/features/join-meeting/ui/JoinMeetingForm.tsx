import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Hash, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../../app/store'
import { Button } from '../../../shared/ui/button'
import { joinMeetingSchema, type JoinMeetingValues } from '../model/join-meeting.schema'
import { useEnterMeeting } from '../model/use-enter-meeting'

type JoinMeetingFormProps = { defaultCode?: string }

export const JoinMeetingForm = ({ defaultCode = '' }: JoinMeetingFormProps) => {
  const { t } = useTranslation()
  const profileName = useAppSelector((state) => state.auth.user?.displayName ?? '')
  const { enter, errorKey, isPending } = useEnterMeeting()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<JoinMeetingValues>({
    defaultValues: { displayName: profileName, meetingCode: defaultCode },
    resolver: zodResolver(joinMeetingSchema),
  })

  const submit = handleSubmit((values) => enter({ code: values.meetingCode, displayName: values.displayName }))

  return (
    <form className="room-form" noValidate onSubmit={(event) => void submit(event)}>
      <div className="room-field">
        <label htmlFor="join-display-name">{t('homeLobby.displayName')}</label>
        <div className="room-input-shell">
          <UserRound aria-hidden="true" size={18} />
          <input
            autoComplete="name"
            id="join-display-name"
            placeholder={t('homeLobby.displayNamePlaceholder')}
            {...register('displayName')}
          />
        </div>
        {errors.displayName?.message && (
          <p className="form-error" role="alert">
            {t(errors.displayName.message)}
          </p>
        )}
      </div>

      <div className="room-field">
        <label htmlFor="join-meeting-code">{t('joinMeeting.code')}</label>
        <div className="room-input-shell">
          <Hash aria-hidden="true" size={18} />
          <input
            autoCapitalize="none"
            id="join-meeting-code"
            placeholder={t('joinMeeting.placeholder')}
            {...register('meetingCode')}
          />
        </div>
        {errors.meetingCode?.message && (
          <p className="form-error" role="alert">
            {t(errors.meetingCode.message)}
          </p>
        )}
      </div>

      {errorKey && (
        <p className="form-error" role="alert">
          {t(errorKey)}
        </p>
      )}

      <Button className="room-primary-action" disabled={isPending} type="submit">
        {t('joinMeeting.submit')}
        <ArrowRight size={20} />
      </Button>
    </form>
  )
}
