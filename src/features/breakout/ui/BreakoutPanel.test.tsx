import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import meetingSessionReducer from '../../../entities/meeting/model/meeting-session.slice'
import breakoutReducer, { roomsLoaded } from '../model/breakout.slice'
import { BreakoutPanel } from './BreakoutPanel'

const create = vi.fn()
const assign = vi.fn()
const sendBack = vi.fn()
const closeRoom = vi.fn()

vi.mock('../api/breakout.api', () => ({
  useAssignParticipantMutation: () => ({ isPending: false, mutateAsync: assign }),
  useCloseBreakoutRoomMutation: () => ({ isPending: false, mutateAsync: closeRoom }),
  useCreateBreakoutRoomMutation: () => ({ isPending: false, mutateAsync: create }),
  useReturnParticipantMutation: () => ({ isPending: false, mutateAsync: sendBack }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => (values?.name ? `${key}:${values.name}` : key) }),
}))

const candidates = [
  { id: 'p1', name: 'An' },
  { id: 'p2', name: 'Bình' },
]

const setup = (prepare?: (store: ReturnType<typeof makeStore>) => void, unresolved: string[] = []) => {
  const store = makeStore()
  prepare?.(store)
  render(
    <Provider store={store}>
      <BreakoutPanel candidates={candidates} code="gm-abcd-efgh" hostParticipantId="h1" unresolved={unresolved} />
    </Provider>,
  )
  return store
}

const makeStore = () => configureStore({ reducer: { breakout: breakoutReducer, meetingSession: meetingSessionReducer } })

const room = { id: 'b1', name: 'Nhóm 1', participants: [] }

const roomWithAn = { ...room, participants: [{ displayName: 'An', participantId: 'p1' }] }

describe('BreakoutPanel', () => {
  beforeEach(() => {
    create.mockReset()
    assign.mockReset()
    sendBack.mockReset()
    closeRoom.mockReset()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('creates a room and shows it in the list', async () => {
    const user = userEvent.setup()
    create.mockResolvedValue({ createdAt: '2026-10-20T10:00:00Z', id: 'b1', meetingId: 'm1', name: 'Nhóm 1' })
    const store = setup()

    await user.type(screen.getByLabelText('breakout.roomName'), '  Nhóm 1 ')
    await user.click(screen.getByRole('button', { name: 'breakout.create' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', name: 'Nhóm 1' }))
    await waitFor(() => expect(store.getState().breakout.rooms).toEqual([room]))
    expect(await screen.findByRole('region', { name: 'Nhóm 1' })).toBeInTheDocument()
  })

  it('moves the chosen participant into the room', async () => {
    const user = userEvent.setup()
    assign.mockResolvedValue(undefined)
    setup((target) => target.dispatch(roomsLoaded([room])))

    await user.selectOptions(screen.getByLabelText('breakout.assignTo:Nhóm 1'), 'p2')

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', participantId: 'p2', roomId: 'b1' }),
    )
  })

  it('lists the participants the server reports in each room', () => {
    setup((target) => target.dispatch(roomsLoaded([roomWithAn, { id: 'b2', name: 'Nhóm 2', participants: [] }])))

    expect(screen.getByText('An', { selector: 'li span' })).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(2)
  })

  it('sends a participant back to the main room', async () => {
    const user = userEvent.setup()
    sendBack.mockResolvedValue(undefined)
    setup((target) => target.dispatch(roomsLoaded([roomWithAn])))

    await user.click(screen.getByRole('button', { name: 'breakout.sendBack:An' }))

    await waitFor(() =>
      expect(sendBack).toHaveBeenCalledWith({
        callerParticipantId: 'h1',
        code: 'gm-abcd-efgh',
        participantId: 'p1',
        roomId: 'b1',
      }),
    )
  })

  it('closes a room after confirmation', async () => {
    const user = userEvent.setup()
    closeRoom.mockResolvedValue(undefined)
    const store = setup((target) => target.dispatch(roomsLoaded([roomWithAn])))

    await user.click(screen.getByRole('button', { name: 'breakout.close:Nhóm 1' }))

    await waitFor(() => expect(closeRoom).toHaveBeenCalledWith({ code: 'gm-abcd-efgh', hostParticipantId: 'h1', roomId: 'b1' }))
    await waitFor(() => expect(store.getState().breakout).toEqual({ rooms: [] }))
  })

  it('does not close the room when the host cancels the confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    setup((target) => target.dispatch(roomsLoaded([room])))

    await user.click(screen.getByRole('button', { name: 'breakout.close:Nhóm 1' }))

    expect(closeRoom).not.toHaveBeenCalled()
  })

  it('warns about participants that cannot be identified', () => {
    setup(undefined, ['Cường'])

    expect(screen.getByText('breakout.unresolved')).toBeInTheDocument()
  })
})
