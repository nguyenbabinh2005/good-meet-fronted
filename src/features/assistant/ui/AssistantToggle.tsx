import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../../app/store'
import { getApiError } from '../../../shared/api/api-error'
import { ToggleRow } from '../../../shared/ui/toggle-row'
import { useSetAssistantMutation } from '../api/assistant.api.ts'
import { assistantSet } from '../model/assistant.slice.ts'
import { useAssistantEnabled } from '../model/use-assistant-enabled.ts'
import styles from './AssistantToggle.module.scss'

type AssistantToggleProps = { code: string; hostParticipantId: string }

export const AssistantToggle = ({ code, hostParticipantId }: AssistantToggleProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const enabled = useAssistantEnabled(code)
  const mutation = useSetAssistantMutation()
  const [error, setError] = useState<string>()

  const change = async (next: boolean) => {
    setError(undefined)
    try {
      const result = await mutation.mutateAsync({ code, enabled: next, hostParticipantId })
      dispatch(assistantSet({ code, enabled: result.enabled }))
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
