import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REACTION_VISIBLE_MS } from '../model/reactions.ts'
import { ReactionOverlay } from './ReactionOverlay.tsx'

let deliver: (payload: unknown) => void = () => {}
let topic: string | undefined

vi.mock('../../../shared/realtime', () => ({
  useRealtimeSubscription: (destination: string | undefined, handler: (payload: unknown) => void) => {
    topic = destination
    deliver = handler
  },
}))

const reaction = (emoji: string, displayName: string) => ({
  displayName,
  emoji,
  meetingId: 'm1',
  participantId: 'p1',
})

describe('ReactionOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('listens on the reactions topic of the meeting', () => {
    render(<ReactionOverlay meetingId="m1" />)

    expect(topic).toBe('/topic/meetings/m1/reactions')
  })

  it('shows an incoming reaction with the sender name and removes it after a few seconds', () => {
    render(<ReactionOverlay meetingId="m1" />)

    act(() => deliver(reaction('🎉', 'An')))
    expect(screen.getByText('🎉')).toBeInTheDocument()
    expect(screen.getByText('An')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(REACTION_VISIBLE_MS + 50)
    })
    expect(screen.queryByText('🎉')).not.toBeInTheDocument()
  })

  it('shows several reactions at once and expires them independently', () => {
    render(<ReactionOverlay meetingId="m1" />)

    act(() => deliver(reaction('👍', 'An')))
    act(() => {
      vi.advanceTimersByTime(2_000)
    })
    act(() => deliver(reaction('❤️', 'Bình')))

    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('❤️')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(REACTION_VISIBLE_MS - 2_000 + 50)
    })
    expect(screen.queryByText('👍')).not.toBeInTheDocument()
    expect(screen.getByText('❤️')).toBeInTheDocument()
  })
})
