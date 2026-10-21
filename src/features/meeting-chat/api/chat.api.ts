import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../shared/api/api-client'
import { participantHeaders } from '../../../shared/api/http-client'
import type { ChatMessage } from '../model/types'

export const chatKeys = {
  history: (code: string, participantId: string) => ['chat', code, participantId] as const,
}

/** GET /meetings/{code}/chat/messages: history of the meeting, including earlier sessions. */
export const useChatHistoryQuery = (code: string, participantId: string) =>
  useQuery({
    queryFn: () =>
      apiRequest<ChatMessage[]>({
        headers: participantHeaders(participantId),
        url: `/meetings/${encodeURIComponent(code)}/chat/messages`,
      }),
    queryKey: chatKeys.history(code, participantId),
    gcTime: 0,
    staleTime: Number.POSITIVE_INFINITY,
  })
