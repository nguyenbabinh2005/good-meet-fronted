import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../shared/api/api-client'
import { userHeaders } from '../../../shared/api/http-client'
import type { Minutes } from '../model/types.ts'

const minutesPath = (code: string) => `/meetings/${encodeURIComponent(code)}/minutes`

export const minutesQueryKey = (code: string, userId: string) => ['minutes', code, userId]

export type GenerateMinutesInput = { code: string; userId: string }

export const generateMinutes = ({ code, userId }: GenerateMinutesInput) =>
  apiRequest<Minutes>({
    headers: userHeaders(userId),
    method: 'POST',
    timeout: 90_000,
    url: minutesPath(code),
  })

export const getMinutesHistory = ({ code, userId }: { code: string; userId: string }) =>
  apiRequest<Minutes[]>({ headers: userHeaders(userId), url: minutesPath(code) })

export const useGenerateMinutesMutation = () => useMutation({ mutationFn: generateMinutes })

export const useMinutesHistoryQuery = (code: string, userId: string) =>
  useQuery({
    gcTime: 0,
    queryFn: () => getMinutesHistory({ code, userId }),
    queryKey: minutesQueryKey(code, userId),
    refetchInterval: 5000,
  })
