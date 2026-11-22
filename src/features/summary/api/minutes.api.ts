import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../shared/api/api-client'
import { userHeaders } from '../../../shared/api/http-client'
import type { Minutes } from '../model/types'

export const getMinutesHistory = ({ code, userId }: { code: string; userId: string }) =>
  apiRequest<Minutes[]>({
    headers: userHeaders(userId),
    url: `/meetings/${encodeURIComponent(code)}/minutes`,
  })

export const useMinutesHistoryQuery = (code: string, userId: string) =>
  useQuery({
    gcTime: 0,
    queryFn: () => getMinutesHistory({ code, userId }),
    queryKey: ['minutes', code, userId],
    refetchInterval: 5000,
  })
