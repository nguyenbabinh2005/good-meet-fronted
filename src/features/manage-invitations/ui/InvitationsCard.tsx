import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  useInvitationsQuery,
  useInviteMutation,
  useRemoveInvitationMutation,
} from '../../../entities/meeting/api/meeting.api'
import { getApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/ui/button'
import { inviteSchema, type InviteValues } from '../model/invite.schema'

type InvitationsCardProps = { code: string; participantId: string }

/** Host-only list of invited emails (the backend stores them; it does not send mail). */
export const InvitationsCard = ({ code, participantId }: InvitationsCardProps) => {
  const { t } = useTranslation()
  const invitations = useInvitationsQuery(code, participantId)
  const invite = useInviteMutation(code)
  const remove = useRemoveInvitationMutation(code)
  const [requestError, setRequestError] = useState<string>()
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<InviteValues>({ defaultValues: { email: '' }, resolver: zodResolver(inviteSchema) })

  const submit = handleSubmit(async ({ email }) => {
    setRequestError(undefined)
    try {
      await invite.mutateAsync({ email, participantId })
      reset()
    } catch (error) {
      setRequestError(getApiError(error)?.message ?? t('meetingDetail.invitations.error'))
    }
  })

  return (
    <section className="detail-card" aria-labelledby="invitations-title">
      <h2 id="invitations-title">{t('meetingDetail.invitations.title')}</h2>
      <p className="detail-hint">{t('meetingDetail.invitations.hint')}</p>

      <form className="invite-form" noValidate onSubmit={(event) => void submit(event)}>
        <div className="room-input-shell">
          <Mail aria-hidden="true" size={18} />
          <input
            aria-label={t('meetingDetail.invitations.email')}
            autoCapitalize="none"
            inputMode="email"
            placeholder={t('meetingDetail.invitations.placeholder')}
            {...register('email')}
          />
        </div>
        <Button disabled={invite.isPending} type="submit">
          {t('meetingDetail.invitations.add')}
        </Button>
      </form>
      {errors.email?.message && (
        <p className="form-error" role="alert">
          {t(errors.email.message)}
        </p>
      )}
      {requestError && (
        <p className="form-error" role="alert">
          {requestError}
        </p>
      )}

      {invitations.isError && <p className="form-error">{t('meetingDetail.invitations.loadFailed')}</p>}
      {invitations.data?.length === 0 && <p className="meeting-list-empty">{t('meetingDetail.invitations.empty')}</p>}
      <ul className="invitation-list">
        {invitations.data?.map((item) => (
          <li key={item.id}>
            <span>{item.email}</span>
            <button
              aria-label={t('meetingDetail.invitations.remove', { email: item.email })}
              disabled={remove.isPending}
              onClick={() => remove.mutate({ invitationId: item.id, participantId })}
              type="button"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
