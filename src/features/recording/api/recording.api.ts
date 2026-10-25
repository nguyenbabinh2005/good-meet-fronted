import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { Recording } from '../model/types.ts'

const recordingsPath = (code: string) => `/meetings/${encodeURIComponent(code)}/recordings`

export const recordingsQueryKey = (code: string, participantId: string) => ['recordings', code, participantId]

export type RecordingControlInput = { code: string; hostParticipantId: string }

export const startRecording = ({ code, hostParticipantId }: RecordingControlInput) =>
  apiRequest<Recording>({
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: recordingsPath(code),
  })

export const stopRecording = ({ code, hostParticipantId }: RecordingControlInput) =>
  apiRequest<Recording>({
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: `${recordingsPath(code)}/stop`,
  })

export const getRecordings = ({ code, participantId }: { code: string; participantId: string }) =>
  apiRequest<Recording[]>({ headers: participantHeaders(participantId), url: recordingsPath(code) })

export const useStartRecordingMutation = () => useMutation({ mutationFn: startRecording })

export const useStopRecordingMutation = () => useMutation({ mutationFn: stopRecording })

export const useRecordingsQuery = (code: string, participantId: string) =>
  useQuery({
    gcTime: 0,
    queryFn: () => getRecordings({ code, participantId }),
    queryKey: recordingsQueryKey(code, participantId),
    refetchInterval: 5000,
  })
