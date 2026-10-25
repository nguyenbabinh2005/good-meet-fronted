import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { NotesView, TranscriptLine } from '../model/types.ts'

const meetingPath = (code: string) => `/meetings/${encodeURIComponent(code)}`

export type SetNotesInput = { code: string; enabled: boolean; hostParticipantId: string }

export const setNotes = ({ code, enabled, hostParticipantId }: SetNotesInput) =>
  apiRequest<NotesView>({
    data: { enabled },
    headers: participantHeaders(hostParticipantId),
    method: 'PUT',
    url: `${meetingPath(code)}/notes`,
  })

export const getTranscripts = ({ code, participantId }: { code: string; participantId: string }) =>
  apiRequest<TranscriptLine[]>({
    headers: participantHeaders(participantId),
    url: `${meetingPath(code)}/transcripts`,
  })

export const useSetNotesMutation = () => useMutation({ mutationFn: setNotes })

export const useTranscriptsQuery = (code: string, participantId: string) =>
  useQuery({
    gcTime: 0,
    queryFn: () => getTranscripts({ code, participantId }),
    queryKey: ['transcripts', code, participantId],
    refetchInterval: 5000,
  })
