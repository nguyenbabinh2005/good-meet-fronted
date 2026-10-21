export type TimeRangeError = { field: 'endAt' | 'startAt'; key: string }

/**
 * Mirrors MeetingService.validateSchedule: the end must be after the start and
 * the start must be in the future. Inputs are `datetime-local` values.
 */
export const validateTimeRange = (startAt: string, endAt: string, now = Date.now()): TimeRangeError | undefined => {
  const start = Date.parse(startAt)
  const end = Date.parse(endAt)
  if (Number.isNaN(start) || Number.isNaN(end)) return undefined
  if (start <= now) return { field: 'startAt', key: 'validation.schedule.startInFuture' }
  if (end <= start) return { field: 'endAt', key: 'validation.schedule.endAfterStart' }
  return undefined
}

/** Next full hour from `now`, one hour long: a sensible default for a new meeting. */
export const defaultTimeRange = (now = new Date()) => {
  const start = new Date(now)
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  return { endAt: toLocalInput(end), startAt: toLocalInput(start) }
}

const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
