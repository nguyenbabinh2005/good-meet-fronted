import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import meetingSessionReducer, {
  meetingSessionEstablished,
  meetingSessionRoomChanged,
} from '../../../entities/meeting/model/meeting-session.slice'
import { BreakoutBanner } from './BreakoutBanner.tsx'

const calls: unknown[] = []
let outcome: () => Promise<void> = () => Promise.resolve()

vi.mock('../api/breakout.api', () => ({
  useReturnParticipantMutation: () => ({
    isPending: false,
    mutateAsync: (input: unknown) => {
      calls.push(input)
      return outcome()
    },
  }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => (values?.name ? `${key}:${values.name}` : key) }),
}))

const join = {
  displayName: 'An',
  mediaToken: 'main-token',
  mediaTokenExpiresAt: '2026-10-20T10:10:00Z',
  mediaUrl: 'ws://localhost:7880',
  meetingId: 'm1',
  participantId: 'p1',
  publicCode: 'gm-abcd-efgh',
  role: 'PARTICIPANT' as const,
}

const setup = (inBreakout: boolean) => {
  const store = configureStore({ reducer: { meetingSession: meetingSessionReducer } })
  store.dispatch(meetingSessionEstablished(join))
  if (inBreakout) {
    store.dispatch(
      meetingSessionRoomChanged({
        breakoutRoomId: 'b1',
        mediaToken: 'breakout-token',
        mediaTokenExpiresAt: '2026-10-20T10:20:00Z',
        mediaUrl: 'ws://localhost:7880',
        roomName: 'Nhóm 1',
        type: 'BREAKOUT',
      }),
    )
  }
  render(
    <Provider store={store}>
      <BreakoutBanner code="gm-abcd-efgh" participantId="p1" />
    </Provider>,
  )
}

describe('BreakoutBanner', () => {
  beforeEach(() => {
    calls.length = 0
    outcome = () => Promise.resolve()
  })

  it('renders nothing in the main room', () => {
    setup(false)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('names the breakout room and lets the participant go back on their own', async () => {
    const user = userEvent.setup()
    setup(true)

    expect(screen.getByText('breakout.youAreIn:Nhóm 1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /breakout.backToMain/ }))

    await waitFor(() =>
      expect(calls).toEqual([
        {
          callerParticipantId: 'p1',
          code: 'gm-abcd-efgh',
          participantId: 'p1',
          roomId: 'b1',
        },
      ]),
    )
  })

  it('reports a failed return', async () => {
    const user = userEvent.setup()
    outcome = () => Promise.reject(new Error('boom'))
    setup(true)

    await user.click(screen.getByRole('button', { name: /breakout.backToMain/ }))

    expect(await screen.findByText('breakout.errors.generic')).toBeInTheDocument()
  })
})
