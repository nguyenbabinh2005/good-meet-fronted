import { describe, expect, it } from 'vitest'
import { normalizeMeetingCode } from './meeting-code'

describe('normalizeMeetingCode', () => {
  it('trims and lower-cases a bare code', () => {
    expect(normalizeMeetingCode('  GM-ABCD-EFGH ')).toBe('gm-abcd-efgh')
  })

  it('extracts the code from an invite link', () => {
    expect(normalizeMeetingCode('http://localhost:5173/join?code=gm-abcd-efgh')).toBe('gm-abcd-efgh')
  })

  it('extracts the code from a room link', () => {
    expect(normalizeMeetingCode('https://meet.example.com/meetings/GM-ABCD-EFGH')).toBe('gm-abcd-efgh')
  })
})
