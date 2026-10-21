import { useMutation } from '@tanstack/react-query'
import { apiRequestVoid } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'

const roomParticipant = (code: string, identity: string) =>
  `/meetings/${encodeURIComponent(code)}/room-participants/${encodeURIComponent(identity)}`

type HostCall = { code: string; hostParticipantId: string; identity: string }

/** POST /meetings/{code}/room-participants/{identity}/kick (host only) */
export const kickParticipant = ({ code, hostParticipantId, identity }: HostCall) =>
  apiRequestVoid({ headers: participantHeaders(hostParticipantId), method: 'POST', url: `${roomParticipant(code, identity)}/kick` })

/** POST /meetings/{code}/room-participants/{identity}/mute (host only; mutes a single track) */
export const muteParticipantTrack = ({ code, hostParticipantId, identity, trackSid }: HostCall & { trackSid: string }) =>
  apiRequestVoid({
    data: { trackSid },
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: `${roomParticipant(code, identity)}/mute`,
  })

/** POST /join-requests/{requestId}/decision (host only) */
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

export const useKickParticipantMutation = () => useMutation({ mutationFn: kickParticipant })
export const useMuteParticipantMutation = () => useMutation({ mutationFn: muteParticipantTrack })
export const useDecideJoinRequestMutation = () => useMutation({ mutationFn: decideJoinRequest })
