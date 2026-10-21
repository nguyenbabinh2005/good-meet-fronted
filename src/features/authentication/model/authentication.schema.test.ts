import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './authentication.schema'

const valid = { confirmPassword: 'secret1', displayName: 'Billy Nguyen', email: 'billy@example.com', password: 'secret1' }

describe('authentication validation', () => {
  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('requires at least six characters, like the backend', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'short', password: 'short' }).success).toBe(false)
  })

  it('requires the confirmed password to match', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'different' }).success).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it('lets any non-empty password through on login so the server decides', () => {
    expect(loginSchema.safeParse({ displayName: '', email: 'billy@example.com', password: 'x' }).success).toBe(true)
  })
})
