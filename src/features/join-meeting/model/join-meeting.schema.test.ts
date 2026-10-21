import { describe, expect, it } from 'vitest'
import { joinMeetingSchema } from './join-meeting.schema'

describe('joinMeetingSchema', () => {
  it('accepts a name and a meeting code', () => {
    expect(joinMeetingSchema.safeParse({ displayName: 'Bình', meetingCode: 'gm-abcd-efgh' }).success).toBe(true)
  })

  it('accepts a pasted invite link', () => {
    expect(
      joinMeetingSchema.safeParse({ displayName: 'Bình', meetingCode: 'http://x.test/join?code=gm-abcd-efgh' }).success,
    ).toBe(true)
  })

  it('requires a display name', () => {
    expect(joinMeetingSchema.safeParse({ displayName: ' ', meetingCode: 'gm-abcd-efgh' }).success).toBe(false)
  })

  it('rejects a code that is too short', () => {
    expect(joinMeetingSchema.safeParse({ displayName: 'Bình', meetingCode: 'gm' }).success).toBe(false)
  })
})
