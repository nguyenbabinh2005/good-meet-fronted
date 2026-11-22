import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meetingKeys } from '../../../entities/meeting/api/meeting.api'
import type { MeetingDetail } from '../../../entities/meeting/model/types'
import { getApiError } from '../../../shared/api/api-error'
import { ToggleRow } from '../../../shared/ui/toggle-row'
import { useSetAssistantMutation } from '../api/assistant.api'
import { useAssistantEnabled } from '../model/use-assistant-enabled'
import styles from './AssistantToggle.module.scss'

type AssistantToggleProps = { code: string; hostParticipantId: string }

export const AssistantToggle = ({ code, hostParticipantId }: AssistantToggleProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const enabled = useAssistantEnabled(code)
  const mutation = useSetAssistantMutation()
  const [error, setError] = useState<string>()

  const change = async (next: boolean) => {
    setError(undefined)
    try {
      const result = await mutation.mutateAsync({ code, enabled: next, hostParticipantId })
      queryClient.setQueryData<MeetingDetail>(meetingKeys.detail(code), (previous) =>
        previous ? { ...previous, assistantEnabled: result.enabled } : previous,
      )
    } catch (failure) {
      setError(getApiError(failure)?.message ?? t('assistant.errors.toggle'))
    }
  }

  return (
    <div className={styles.wrap}>
      <ToggleRow
        checked={enabled}
        disabled={mutation.isPending}
        hint={t('assistant.hint')}
        label={t('assistant.title')}
        onChange={(next) => void change(next)}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
