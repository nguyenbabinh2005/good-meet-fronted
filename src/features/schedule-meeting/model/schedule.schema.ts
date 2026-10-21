import { z } from 'zod'
import { validateTimeRange } from '../lib/time-range'

const title = z.string().trim().min(1, 'validation.schedule.titleRequired').max(200)
const startAt = z.string().min(1, 'validation.schedule.startRequired')
const endAt = z.string().min(1, 'validation.schedule.endRequired')

const checkRange = (values: { endAt: string; startAt: string }, ctx: z.RefinementCtx) => {
  const error = validateTimeRange(values.startAt, values.endAt)
  if (error) ctx.addIssue({ code: 'custom', message: error.key, path: [error.field] })
}

export const scheduleSchema = z.object({ endAt, startAt, title }).superRefine(checkRange)
// Same shape as the create form so one form component serves both; the title is not sent on reschedule.
export const rescheduleSchema = z.object({ endAt, startAt, title: z.string() }).superRefine(checkRange)

export type ScheduleValues = z.infer<typeof scheduleSchema>
export type RescheduleValues = z.infer<typeof rescheduleSchema>
