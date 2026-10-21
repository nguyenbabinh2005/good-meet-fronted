import { describe, expect, it } from 'vitest'
import { inviteSchema } from './invite.schema'

describe('inviteSchema', () => {
  it('accepts an email address', () => {
    expect(inviteSchema.safeParse({ email: ' an@example.com ' }).success).toBe(true)
  })

  it('rejects text that is not an email', () => {
    expect(inviteSchema.safeParse({ email: 'an' }).success).toBe(false)
  })
})
