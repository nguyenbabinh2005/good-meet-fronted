import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Type } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/ui/button'
import { defaultTimeRange } from '../lib/time-range'
import { rescheduleSchema, scheduleSchema, type ScheduleValues } from '../model/schedule.schema'

type ScheduleMeetingFormProps = {
  /** `reschedule` hides the title (the backend only changes the times). */
  defaultValues?: Partial<ScheduleValues>
  mode?: 'create' | 'reschedule'
  onCancel?: () => void
  onSubmit: (values: ScheduleValues) => Promise<void>
  pending?: boolean
  submitLabel: string
}

export const ScheduleMeetingForm = ({
  defaultValues,
  mode = 'create',
  onCancel,
  onSubmit,
  pending = false,
  submitLabel,
}: ScheduleMeetingFormProps) => {
  const { t } = useTranslation()
  const [requestError, setRequestError] = useState<string>()
  const isReschedule = mode === 'reschedule'
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ScheduleValues>({
    defaultValues: { title: '', ...defaultTimeRange(), ...defaultValues },
    resolver: zodResolver(isReschedule ? rescheduleSchema : scheduleSchema),
  })

  const submit = handleSubmit(async (values) => {
    setRequestError(undefined)
    try {
      await onSubmit(values)
    } catch (error) {
      const apiError = getApiError(error)
      setRequestError(apiError?.message ?? t('schedule.errors.generic'))
    }
  })

  return (
    <form className="room-form" noValidate onSubmit={(event) => void submit(event)}>
      {!isReschedule && (
        <div className="room-field">
          <label htmlFor="schedule-title">{t('schedule.title')}</label>
          <div className="room-input-shell">
            <Type aria-hidden="true" size={18} />
            <input id="schedule-title" placeholder={t('schedule.titlePlaceholder')} {...register('title')} />
          </div>
          {errors.title?.message && (
            <p className="form-error" role="alert">
              {t(errors.title.message)}
            </p>
          )}
        </div>
      )}

      <div className="schedule-times">
        <div className="room-field">
          <label htmlFor="schedule-start">{t('schedule.start')}</label>
          <div className="room-input-shell">
            <CalendarClock aria-hidden="true" size={18} />
            <input id="schedule-start" type="datetime-local" {...register('startAt')} />
          </div>
          {errors.startAt?.message && (
            <p className="form-error" role="alert">
              {t(errors.startAt.message)}
            </p>
          )}
        </div>
        <div className="room-field">
          <label htmlFor="schedule-end">{t('schedule.end')}</label>
          <div className="room-input-shell">
            <CalendarClock aria-hidden="true" size={18} />
            <input id="schedule-end" type="datetime-local" {...register('endAt')} />
          </div>
          {errors.endAt?.message && (
            <p className="form-error" role="alert">
              {t(errors.endAt.message)}
            </p>
          )}
        </div>
      </div>

      {requestError && (
        <p className="form-error" role="alert">
          {requestError}
        </p>
      )}

      <div className="form-actions">
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            {t('common.cancel')}
          </Button>
        )}
        <Button disabled={pending} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
