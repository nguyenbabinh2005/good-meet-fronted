import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { getApiError } from './api-error'

const failure = (status: number, data: unknown) =>
  new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    config: {} as never,
    data,
    headers: {},
    status,
    statusText: '',
  })

describe('getApiError', () => {
  it('reads the status and message of a ResponseStatusException body', () => {
    expect(getApiError(failure(409, { message: 'Email is already registered', status: 409 }))).toEqual({
      fieldErrors: {},
      message: 'Email is already registered',
      status: 409,
    })
  })

  it('maps bean-validation errors by field', () => {
    const error = getApiError(
      failure(400, { errors: [{ defaultMessage: 'must be a well-formed email address', field: 'email' }], status: 400 }),
    )
    expect(error?.fieldErrors).toEqual({ email: 'must be a well-formed email address' })
  })

  it('returns undefined for non-HTTP errors', () => {
    expect(getApiError(new Error('boom'))).toBeUndefined()
  })
})
