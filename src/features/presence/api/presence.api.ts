import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest, apiRequestVoid } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { HandsSnapshot } from '../model/types'

const meetingPath = (code: string) => `/meetings/${encodeURIComponent(code)}`

export type SetHandInput = { code: string; participantId: string; raised: boolean }
export type LowerHandInput = { code: string; hostParticipantId: string; targetParticipantId: string }
export type SendReactionInput = { code: string; emoji: string; participantId: string }

export const getHands = ({ code, participantId }: { code: string; participantId: string }) =>
  apiRequest<HandsSnapshot>({ headers: participantHeaders(participantId), url: `${meetingPath(code)}/hands` })

export const setHand = ({ code, participantId, raised }: SetHandInput) =>
  apiRequestVoid({
    data: { raised },
    headers: participantHeaders(participantId),
    method: 'PUT',
    url: `${meetingPath(code)}/hand`,
  })

export const lowerHand = ({ code, hostParticipantId, targetParticipantId }: LowerHandInput) =>
  apiRequestVoid({
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: `${meetingPath(code)}/hands/${encodeURIComponent(targetParticipantId)}/lower`,
  })

export const sendReaction = ({ code, emoji, participantId }: SendReactionInput) =>
  apiRequestVoid({
    data: { emoji },
    headers: participantHeaders(participantId),
    method: 'POST',
    url: `${meetingPath(code)}/reactions`,
  })

export const useSetHandMutation = () => useMutation({ mutationFn: setHand })
export const useLowerHandMutation = () => useMutation({ mutationFn: lowerHand })
export const useSendReactionMutation = () => useMutation({ mutationFn: sendReaction })

export const useHandsQuery = (code: string, participantId: string) =>
  useQuery({
    gcTime: 0,
    queryFn: () => getHands({ code, participantId }),
    queryKey: ['hands', code, participantId],
    staleTime: Number.POSITIVE_INFINITY,
  })
