import { describe, expect, it } from 'vitest'
import { defaultTimeRange, validateTimeRange } from './time-range'

const now = Date.parse('2026-10-20T10:00')

describe('validateTimeRange', () => {
  it('accepts a future range', () => {
    expect(validateTimeRange('2026-10-20T11:00', '2026-10-20T12:00', now)).toBeUndefined()
  })

  it('rejects a start in the past', () => {
    expect(validateTimeRange('2026-10-20T09:00', '2026-10-20T12:00', now)).toEqual({
      field: 'startAt',
      key: 'validation.schedule.startInFuture',
    })
  })

  it('rejects an end that is not after the start', () => {
    expect(validateTimeRange('2026-10-20T12:00', '2026-10-20T12:00', now)).toEqual({
      field: 'endAt',
      key: 'validation.schedule.endAfterStart',
    })
  })
})

describe('defaultTimeRange', () => {
  it('starts on the next full hour and lasts one hour', () => {
    expect(defaultTimeRange(new Date('2026-10-20T10:20'))).toEqual({
      endAt: '2026-10-20T12:00',
      startAt: '2026-10-20T11:00',
    })
  })
})
