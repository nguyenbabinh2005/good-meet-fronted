import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest, apiRequestVoid } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { WaitingRequest } from '../model/waiting-room'

const roomParticipant = (code: string, identity: string) =>
  `/meetings/${encodeURIComponent(code)}/room-participants/${encodeURIComponent(identity)}`

type HostCall = { code: string; hostParticipantId: string; identity: string }

export const kickParticipant = ({ code, hostParticipantId, identity }: HostCall) =>
  apiRequestVoid({ headers: participantHeaders(hostParticipantId), method: 'POST', url: `${roomParticipant(code, identity)}/kick` })

export const muteParticipantTrack = ({ code, hostParticipantId, identity, trackSid }: HostCall & { trackSid: string }) =>
  apiRequestVoid({
    data: { trackSid },
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: `${roomParticipant(code, identity)}/mute`,
  })

export const decideJoinRequest = ({
  approved,
  hostParticipantId,
  requestId,
}: {
  approved: boolean
  hostParticipantId: string
  requestId: string
}) =>
  apiRequestVoid({
    data: { approved },
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: `/join-requests/${encodeURIComponent(requestId)}/decision`,
  })

export const listWaitingRequests = ({ code, hostParticipantId }: { code: string; hostParticipantId: string }) =>
  apiRequest<WaitingRequest[]>({
    headers: participantHeaders(hostParticipantId),
    url: `/meetings/${encodeURIComponent(code)}/join-requests`,
  })

export const useKickParticipantMutation = () => useMutation({ mutationFn: kickParticipant })
export const useMuteParticipantMutation = () => useMutation({ mutationFn: muteParticipantTrack })
export const useDecideJoinRequestMutation = () => useMutation({ mutationFn: decideJoinRequest })

export const useWaitingRequestsQuery = (code: string, hostParticipantId: string, enabled: boolean) =>
  useQuery({
    enabled,
    gcTime: 0,
    queryFn: () => listWaitingRequests({ code, hostParticipantId }),
    queryKey: ['join-requests', code, hostParticipantId],
    staleTime: Number.POSITIVE_INFINITY,
  })
