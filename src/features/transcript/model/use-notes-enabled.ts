import { useAppSelector } from '../../../app/store'

export const useNotesEnabled = (code: string) =>
  useAppSelector(
    (state) =>
      state.notes.byCode[code] ?? state.myMeetings.items.find((item) => item.publicCode === code)?.notesEnabled ?? false,
  )
