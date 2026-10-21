import { describe, expect, it } from 'vitest'
import { mergeMessages } from './merge-messages'
import type { ChatMessage } from './types'

const message = (id: string, sentAt: string): ChatMessage => ({
  content: id,
  id,
  meetingId: 'm1',
  senderName: 'An',
  senderParticipantId: 'p1',
  sentAt,
})

describe('mergeMessages', () => {
  it('removes duplicates delivered by both history and the live topic', () => {
    const merged = mergeMessages([message('a', '2026-10-20T10:00:00Z')], [message('a', '2026-10-20T10:00:00Z')])
    expect(merged).toHaveLength(1)
  })

  it('orders messages by send time', () => {
    const merged = mergeMessages([message('b', '2026-10-20T10:00:02Z')], [message('a', '2026-10-20T10:00:01Z')])
    expect(merged.map((item) => item.id)).toEqual(['a', 'b'])
  })
})
