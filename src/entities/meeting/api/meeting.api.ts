import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest, apiRequestVoid } from '../../../shared/api/api-client'
import { participantHeaders, userHeaders } from '../../../shared/api/http-client'
import type { Invitation, MeetingDetail, MeetingResponse, MyMeeting } from '../model/types'

const path = (code: string) => `/meetings/${encodeURIComponent(code)}`

export const meetingKeys = {
  all: ['meetings'] as const,
  detail: (code: string) => [...meetingKeys.all, code, 'detail'] as const,
  invitations: (code: string) => [...meetingKeys.all, code, 'invitations'] as const,
  mine: (userId: string) => [...meetingKeys.all, 'mine', userId] as const,
}

export type CreateMeetingInput = { displayName: string; title: string; userId: string }
export type ScheduleMeetingInput = CreateMeetingInput & { scheduledEndAt: string; scheduledStartAt: string }
type HostRequest = { code: string; participantId: string }
type OwnerRequest = { code: string; userId: string }

export const getMeeting = (code: string) => apiRequest<MeetingDetail>({ url: path(code) })

export const listMyMeetings = (userId: string) =>
  apiRequest<MyMeeting[]>({ headers: userHeaders(userId), url: '/meetings' })

export const createMeeting = (data: CreateMeetingInput) =>
  apiRequest<MeetingResponse>({ data, method: 'POST', url: '/meetings' })

export const scheduleMeeting = (data: ScheduleMeetingInput) =>
  apiRequest<MeetingResponse>({ data, method: 'POST', url: '/meetings/scheduled' })

export const rescheduleMeeting = ({
  code,
  userId,
  ...data
}: OwnerRequest & { scheduledEndAt: string; scheduledStartAt: string }) =>
  apiRequest<MeetingResponse>({ data, headers: userHeaders(userId), method: 'PUT', url: `${path(code)}/schedule` })

export const cancelMeeting = ({ code, userId }: OwnerRequest) =>
  apiRequest<MeetingResponse>({ headers: userHeaders(userId), method: 'POST', url: `${path(code)}/cancel` })

export const endMeeting = ({ code, participantId }: HostRequest) =>
  apiRequest<MeetingResponse>({ headers: participantHeaders(participantId), method: 'POST', url: `${path(code)}/end` })

export const endSession = ({ code, participantId }: HostRequest) =>
  apiRequestVoid({ headers: participantHeaders(participantId), method: 'POST', url: `${path(code)}/end-session` })

export const listInvitations = ({ code, userId }: OwnerRequest) =>
  apiRequest<Invitation[]>({ headers: userHeaders(userId), url: `${path(code)}/invitations` })

export const addInvitation = ({ code, email, userId }: OwnerRequest & { email: string }) =>
  apiRequest<Invitation>({
    data: { email },
    headers: userHeaders(userId),
    method: 'POST',
    url: `${path(code)}/invitations`,
  })

export const deleteInvitation = ({ code, invitationId, userId }: OwnerRequest & { invitationId: string }) =>
  apiRequestVoid({
    headers: userHeaders(userId),
    method: 'DELETE',
    url: `${path(code)}/invitations/${encodeURIComponent(invitationId)}`,
  })

const useMeetingMutation = <TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.all }),
  })
}

export const useCreateMeetingMutation = () => useMeetingMutation(createMeeting)
export const useScheduleMeetingMutation = () => useMeetingMutation(scheduleMeeting)
export const useRescheduleMeetingMutation = () => useMeetingMutation(rescheduleMeeting)
export const useCancelMeetingMutation = () => useMeetingMutation(cancelMeeting)
export const useEndMeetingMutation = () => useMeetingMutation(endMeeting)
export const useEndSessionMutation = () => useMutation({ mutationFn: endSession })

export const useMeetingQuery = (code: string) =>
  useQuery({
    enabled: Boolean(code),
    queryFn: () => getMeeting(code),
    queryKey: meetingKeys.detail(code),
  })

export const useMyMeetingsQuery = (userId: string | undefined) =>
  useQuery({
    enabled: Boolean(userId),
    queryFn: () => listMyMeetings(userId ?? ''),
    queryKey: meetingKeys.mine(userId ?? ''),
  })

export const useInvitationsQuery = (code: string, userId: string | undefined) =>
  useQuery({
    enabled: Boolean(code && userId),
    queryFn: () => listInvitations({ code, userId: userId ?? '' }),
    queryKey: meetingKeys.invitations(code),
  })

export const useInviteMutation = (code: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, userId }: { email: string; userId: string }) => addInvitation({ code, email, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.invitations(code) }),
  })
}

export const useRemoveInvitationMutation = (code: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, userId }: { invitationId: string; userId: string }) =>
      deleteInvitation({ code, invitationId, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.invitations(code) }),
  })
}
