import { z } from 'zod'
import { normalizeMeetingCode } from '../lib/meeting-code'

export const joinMeetingSchema = z.object({
  displayName: z.string().trim().min(1, 'validation.joinMeeting.displayNameRequired').max(100),
  meetingCode: z
    .string()
    .trim()
    .max(300, 'validation.meetingCode.invalid')
    .refine((value) => normalizeMeetingCode(value).length >= 6, 'validation.meetingCode.invalid'),
})

export type JoinMeetingValues = z.infer<typeof joinMeetingSchema>
