import { useMeetingQuery } from '../../../entities/meeting/api/meeting.api'

export const useNotesEnabled = (code: string) => useMeetingQuery(code).data?.notesEnabled ?? false
