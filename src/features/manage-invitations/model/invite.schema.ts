import { z } from 'zod'

// Mirrors MeetingController.InviteRequest: well-formed email, at most 255 characters.
export const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'validation.authentication.emailRequired')
    .max(255, 'validation.authentication.emailInvalid')
    .pipe(z.email('validation.authentication.emailInvalid')),
})

export type InviteValues = z.infer<typeof inviteSchema>
