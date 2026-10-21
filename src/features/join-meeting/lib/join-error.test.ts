import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { describeJoinError } from './join-error'

const failure = (status: number, message: string) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    config: {} as never,
    data: { message, status },
    headers: {},
    status,
    statusText: '',
  })

describe('describeJoinError', () => {
  it.each([
    [404, 'Meeting not found', 'joinMeeting.errors.notFound'],
    [403, 'Meeting has not started', 'joinMeeting.errors.notStarted'],
    [410, 'Meeting has ended', 'joinMeeting.errors.ended'],
    [410, 'Meeting was cancelled', 'joinMeeting.errors.cancelled'],
    [400, 'Display name is required', 'joinMeeting.errors.invalid'],
  ])('maps %s "%s" to %s', (status, message, key) => {
    expect(describeJoinError(failure(status, message))).toBe(key)
  })

  it('falls back to a generic message for network errors', () => {
    expect(describeJoinError(new Error('Network Error'))).toBe('joinMeeting.errors.generic')
  })
})
