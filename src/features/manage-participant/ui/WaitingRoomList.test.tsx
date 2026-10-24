import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WaitingRoomList } from './WaitingRoomList'

const calls: unknown[] = []

vi.mock('../api/moderation.api', () => ({
  useDecideJoinRequestMutation: () => ({
    isPending: false,
    mutateAsync: (input: unknown) => {
      calls.push(input)
      return Promise.resolve()
    },
  }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => (values?.name ? `${key}:${values.name}` : key) }),
}))

const requests = [
  { displayName: 'An', requestedAt: '2026-10-20T10:00:00Z', requestId: 'r1' },
  { displayName: 'Bình', requestedAt: '2026-10-20T10:01:00Z', requestId: 'r2' },
]

describe('WaitingRoomList', () => {
  beforeEach(() => {
    calls.length = 0
  })

  it('renders nothing when nobody is waiting', () => {
    const { container } = render(<WaitingRoomList hostParticipantId="h1" requests={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a labelled accept and decline button for every person', () => {
    render(<WaitingRoomList hostParticipantId="h1" requests={requests} />)

    expect(screen.getAllByText('meetingRoom.admitAction')).toHaveLength(2)
    expect(screen.getAllByText('meetingRoom.rejectAction')).toHaveLength(2)
  })

  it('accepts and declines the right request', async () => {
    const user = userEvent.setup()
    render(<WaitingRoomList hostParticipantId="h1" requests={requests} />)

    await user.click(screen.getByRole('button', { name: 'meetingRoom.admit:An' }))
    await user.click(screen.getByRole('button', { name: 'meetingRoom.reject:Bình' }))

    expect(calls).toEqual([
      { approved: true, hostParticipantId: 'h1', requestId: 'r1' },
      { approved: false, hostParticipantId: 'h1', requestId: 'r2' },
    ])
  })
})
