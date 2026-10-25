import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../../app/store'
import { getApiError } from '../../../shared/api/api-error'
import { ToggleRow } from '../../../shared/ui/toggle-row'
import { useSetNotesMutation } from '../api/transcript.api.ts'
import { notesSet } from '../model/notes.slice.ts'
import { useNotesEnabled } from '../model/use-notes-enabled.ts'
import styles from './NotesToggle.module.scss'

type NotesToggleProps = { code: string; hostParticipantId: string }

export const NotesToggle = ({ code, hostParticipantId }: NotesToggleProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const enabled = useNotesEnabled(code)
  const mutation = useSetNotesMutation()
  const [error, setError] = useState<string>()

  const change = async (next: boolean) => {
    setError(undefined)
    try {
      const result = await mutation.mutateAsync({ code, enabled: next, hostParticipantId })
      dispatch(notesSet({ code, enabled: result.enabled }))
    } catch (failure) {
      setError(getApiError(failure)?.message ?? t('transcript.errors.toggle'))
    }
  }

  return (
    <div className={styles.wrap}>
      <ToggleRow
        checked={enabled}
        disabled={mutation.isPending}
        hint={t('transcript.notesHint')}
        label={t('transcript.notes')}
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
