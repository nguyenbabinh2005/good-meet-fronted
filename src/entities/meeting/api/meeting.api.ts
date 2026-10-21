import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest, apiRequestVoid } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { Invitation, MeetingResponse } from '../model/types'

const path = (code: string) => `/meetings/${encodeURIComponent(code)}`

export const meetingKeys = {
  all: ['meetings'] as const,
  invitations: (code: string) => [...meetingKeys.all, code, 'invitations'] as const,
}

export type CreateMeetingInput = { displayName: string; title: string; userId: string }
export type ScheduleMeetingInput = CreateMeetingInput & { scheduledEndAt: string; scheduledStartAt: string }
type HostRequest = { code: string; participantId: string }

export const createMeeting = (data: CreateMeetingInput) =>
  apiRequest<MeetingResponse>({ data, method: 'POST', url: '/meetings' })

export const scheduleMeeting = (data: ScheduleMeetingInput) =>
  apiRequest<MeetingResponse>({ data, method: 'POST', url: '/meetings/scheduled' })

export const rescheduleMeeting = ({
  code,
  participantId,
  ...data
}: HostRequest & { scheduledEndAt: string; scheduledStartAt: string }) =>
  apiRequest<MeetingResponse>({ data, headers: participantHeaders(participantId), method: 'PUT', url: `${path(code)}/schedule` })

export const cancelMeeting = ({ code, participantId }: HostRequest) =>
  apiRequest<MeetingResponse>({ headers: participantHeaders(participantId), method: 'POST', url: `${path(code)}/cancel` })

export const endMeeting = ({ code, participantId }: HostRequest) =>
  apiRequest<MeetingResponse>({ headers: participantHeaders(participantId), method: 'POST', url: `${path(code)}/end` })

export const endSession = ({ code, participantId }: HostRequest) =>
  apiRequestVoid({ headers: participantHeaders(participantId), method: 'POST', url: `${path(code)}/end-session` })

export const useCreateMeetingMutation = () => useMutation({ mutationFn: createMeeting })
export const useScheduleMeetingMutation = () => useMutation({ mutationFn: scheduleMeeting })
export const useRescheduleMeetingMutation = () => useMutation({ mutationFn: rescheduleMeeting })
export const useCancelMeetingMutation = () => useMutation({ mutationFn: cancelMeeting })
export const useEndMeetingMutation = () => useMutation({ mutationFn: endMeeting })
export const useEndSessionMutation = () => useMutation({ mutationFn: endSession })

export const useInvitationsQuery = (code: string, participantId: string | undefined) =>
  useQuery({
    enabled: Boolean(code && participantId),
    queryFn: () =>
      apiRequest<Invitation[]>({
        headers: participantHeaders(participantId ?? ''),
        url: `${path(code)}/invitations`,
      }),
    queryKey: meetingKeys.invitations(code),
  })

export const useInviteMutation = (code: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, participantId }: { email: string; participantId: string }) =>
      apiRequest<Invitation>({
        data: { email },
        headers: participantHeaders(participantId),
        method: 'POST',
        url: `${path(code)}/invitations`,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.invitations(code) }),
  })
}

export const useRemoveInvitationMutation = (code: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, participantId }: { invitationId: string; participantId: string }) =>
      apiRequestVoid({
        headers: participantHeaders(participantId),
        method: 'DELETE',
        url: `${path(code)}/invitations/${encodeURIComponent(invitationId)}`,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meetingKeys.invitations(code) }),
  })
}
