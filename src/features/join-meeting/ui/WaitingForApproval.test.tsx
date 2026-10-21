import { configureStore } from '@reduxjs/toolkit'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import meetingSessionReducer from '../../../entities/meeting/model/meeting-session.slice'
import joinRequestReducer, { joinRequestCreated } from '../model/join-request.slice'
import { WaitingForApproval } from './WaitingForApproval'

let pushDecision: (decision: unknown) => void = () => {}
let destination: string | undefined

vi.mock('../../../shared/realtime', () => ({
  useRealtimeSubscription: (dest: string | undefined, handler: (payload: unknown) => void) => {
    destination = dest
    pushDecision = handler
  },
}))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

const result = {
  displayName: 'An',
  mediaToken: 'jwt',
  mediaTokenExpiresAt: '2026-10-20T10:10:00Z',
  mediaUrl: 'ws://localhost:7880',
  meetingId: 'm1',
  participantId: 'p1',
  publicCode: 'gm-abcd-efgh',
  role: 'PARTICIPANT',
}

const setup = () => {
  const store = configureStore({ reducer: { joinRequest: joinRequestReducer, meetingSession: meetingSessionReducer } })
  store.dispatch(joinRequestCreated({ displayName: 'An', publicCode: 'gm-abcd-efgh', requestId: 'r1' }))
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/waiting']}>
        <Routes>
          <Route element={<WaitingForApproval />} path="/waiting" />
          <Route element={<p>room</p>} path="/meetings/:code" />
          <Route element={<p>join page</p>} path="/join" />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return store
}

describe('WaitingForApproval', () => {
  beforeEach(() => {
    destination = undefined
  })

  it('listens on the topic of its own join request', () => {
    setup()
    expect(destination).toBe('/topic/join-requests/r1')
    expect(screen.getByText('waitingRoom.title')).toBeInTheDocument()
  })

  it('enters the room with the token that comes with the approval', () => {
    const store = setup()

    act(() => pushDecision({ approved: true, result }))

    expect(screen.getByText('room')).toBeInTheDocument()
    expect(store.getState().meetingSession.current).toEqual(result)
    expect(store.getState().joinRequest.current).toBeUndefined()
  })

  it('tells the user when the host declines', () => {
    setup()

    act(() => pushDecision({ approved: false, result: null }))

    expect(screen.getByText('waitingRoom.deniedTitle')).toBeInTheDocument()
  })

  it('goes back to the join page when the request is cancelled', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'waitingRoom.cancel' }))

    expect(screen.getByText('join page')).toBeInTheDocument()
  })
})
