import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest, apiRequestVoid } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { BreakoutRoom, BreakoutRoomView } from '../model/types'

const roomsPath = (code: string) => `/meetings/${encodeURIComponent(code)}/breakout-rooms`

const memberPath = (code: string, roomId: string, participantId: string) =>
  `${roomsPath(code)}/${encodeURIComponent(roomId)}/participants/${encodeURIComponent(participantId)}`

export type CreateBreakoutRoomInput = { code: string; hostParticipantId: string; name: string }

export type AssignParticipantInput = {
  code: string
  hostParticipantId: string
  participantId: string
  roomId: string
}

export type ReturnParticipantInput = {
  callerParticipantId: string
  code: string
  participantId: string
  roomId: string
}

export type CloseBreakoutRoomInput = { code: string; hostParticipantId: string; roomId: string }

export const createBreakoutRoom = ({ code, hostParticipantId, name }: CreateBreakoutRoomInput) =>
  apiRequest<BreakoutRoomView>({
    data: { name },
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: roomsPath(code),
  })

export const listBreakoutRooms = ({ code, hostParticipantId }: { code: string; hostParticipantId: string }) =>
  apiRequest<BreakoutRoom[]>({ headers: participantHeaders(hostParticipantId), url: roomsPath(code) })

export const assignParticipant = ({ code, hostParticipantId, participantId, roomId }: AssignParticipantInput) =>
  apiRequestVoid({
    headers: participantHeaders(hostParticipantId),
    method: 'PUT',
    url: memberPath(code, roomId, participantId),
  })

export const returnParticipant = ({ callerParticipantId, code, participantId, roomId }: ReturnParticipantInput) =>
  apiRequestVoid({
    headers: participantHeaders(callerParticipantId),
    method: 'DELETE',
    url: memberPath(code, roomId, participantId),
  })

export const closeBreakoutRoom = ({ code, hostParticipantId, roomId }: CloseBreakoutRoomInput) =>
  apiRequestVoid({
    headers: participantHeaders(hostParticipantId),
    method: 'POST',
    url: `${roomsPath(code)}/${encodeURIComponent(roomId)}/close`,
  })

export const useCreateBreakoutRoomMutation = () => useMutation({ mutationFn: createBreakoutRoom })
export const useAssignParticipantMutation = () => useMutation({ mutationFn: assignParticipant })
export const useReturnParticipantMutation = () => useMutation({ mutationFn: returnParticipant })
export const useCloseBreakoutRoomMutation = () => useMutation({ mutationFn: closeBreakoutRoom })

export const useBreakoutRoomsQuery = (code: string, hostParticipantId: string, enabled: boolean) =>
  useQuery({
    enabled,
    gcTime: 0,
    queryFn: () => listBreakoutRooms({ code, hostParticipantId }),
    queryKey: ['breakout-rooms', code, hostParticipantId],
    staleTime: Number.POSITIVE_INFINITY,
  })
