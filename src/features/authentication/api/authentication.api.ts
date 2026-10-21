import { useMutation } from '@tanstack/react-query'
import { apiRequest, apiRequestVoid } from '../../../shared/api/api-client'
import type { LoginInput, RegisterInput } from '../model/types'

/** POST /auth/register answers 201 with no body. */
export const register = (input: RegisterInput) =>
  apiRequestVoid({ data: input, method: 'POST', url: '/auth/register' })

/** POST /auth/login answers `{ userId }`. */
export const login = async (input: LoginInput) => {
  const { userId } = await apiRequest<{ userId: string }>({ data: input, method: 'POST', url: '/auth/login' })
  return userId
}

export const useLoginMutation = () => useMutation({ mutationFn: login })
export const useRegisterMutation = () => useMutation({ mutationFn: register })
