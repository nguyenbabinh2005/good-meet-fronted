import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rescheduleSchema, scheduleSchema } from './schedule.schema'

describe('schedule validation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-20T10:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('accepts a titled future meeting', () => {
    expect(
      scheduleSchema.safeParse({ endAt: '2026-10-21T10:00', startAt: '2026-10-21T09:00', title: 'Sprint review' }).success,
    ).toBe(true)
  })

  it('requires a title', () => {
    expect(scheduleSchema.safeParse({ endAt: '2026-10-21T10:00', startAt: '2026-10-21T09:00', title: ' ' }).success).toBe(
      false,
    )
  })

  it('reports an end before the start on the end field', () => {
    const result = rescheduleSchema.safeParse({ endAt: '2026-10-21T08:00', startAt: '2026-10-21T09:00', title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({ message: 'validation.schedule.endAfterStart', path: ['endAt'] })
  })
})
