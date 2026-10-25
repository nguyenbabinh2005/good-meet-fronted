import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'

export type AssistantView = { enabled: boolean }

export type SetAssistantInput = { code: string; enabled: boolean; hostParticipantId: string }

export const setAssistant = ({ code, enabled, hostParticipantId }: SetAssistantInput) =>
  apiRequest<AssistantView>({
    data: { enabled },
    headers: participantHeaders(hostParticipantId),
    method: 'PUT',
    url: `/meetings/${encodeURIComponent(code)}/assistant`,
  })

export const useSetAssistantMutation = () => useMutation({ mutationFn: setAssistant })
