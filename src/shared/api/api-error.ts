import axios from 'axios'
import type { ApiErrorInfo } from '../types/api'

type SpringErrorBody = {
  errors?: Array<{ defaultMessage?: string; field?: string }>
  message?: string
  status?: number
}

/**
 * Extracts a normalised error from an Axios failure. Spring returns
 * `{ status, error, message, errors? }`; `errors` lists bean-validation failures.
 */
export const getApiError = (error: unknown): ApiErrorInfo | undefined => {
  if (!axios.isAxiosError<SpringErrorBody>(error)) return undefined

  const body = error.response?.data
  const fieldErrors: Record<string, string> = {}
  if (Array.isArray(body?.errors)) {
    for (const item of body.errors) {
      if (item.field && item.defaultMessage) fieldErrors[item.field] = item.defaultMessage
    }
  }

  return {
    fieldErrors,
    message: typeof body?.message === 'string' && body.message ? body.message : undefined,
    status: error.response?.status ?? body?.status,
  }
}
