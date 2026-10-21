import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { describeAuthError } from './auth-error'

const failure = (status: number) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    config: {} as never,
    data: {},
    headers: {},
    status,
    statusText: '',
  })

describe('describeAuthError', () => {
  it.each([
    [401, 'authentication.errors.invalidCredentials'],
    [409, 'authentication.errors.emailAlreadyRegistered'],
    [400, 'authentication.errors.validation'],
  ])('maps %s to %s', (status, key) => {
    expect(describeAuthError(failure(status))).toBe(key)
  })

  it('reports an unreachable server for network errors', () => {
    expect(describeAuthError(new Error('Network Error'))).toBe('authentication.errors.unavailable')
  })
})
