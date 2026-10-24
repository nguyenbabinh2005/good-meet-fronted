import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import presenceReducer, { handsChanged } from '../model/presence.slice'
import { RaisedHandsList } from './RaisedHandsList'

const setHandCalls: unknown[] = []
const lowerCalls: unknown[] = []

vi.mock('../api/presence.api', () => ({
  useLowerHandMutation: () => ({
    mutate: (input: unknown) => {
      lowerCalls.push(input)
    },
  }),
  useSetHandMutation: () => ({
    mutate: (input: unknown) => {
      setHandCalls.push(input)
    },
  }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => (values?.name ? `${key}:${values.name}` : key) }),
}))

const names: Record<string, string> = { p1: 'An', p2: 'Bình', p3: 'Cường', p9: 'Dung' }

const setup = (raisedIds: string[], isHost: boolean, viewer = 'p1') => {
  const store = configureStore({ reducer: { presence: presenceReducer } })
  store.dispatch(handsChanged(raisedIds.map((participantId) => ({ displayName: names[participantId], participantId }))))
  return render(
    <Provider store={store}>
      <RaisedHandsList code="gm-abcd-efgh" isHost={isHost} participantId={viewer} />
    </Provider>,
  )
}

describe('RaisedHandsList', () => {
  beforeEach(() => {
    setHandCalls.length = 0
    lowerCalls.length = 0
  })

  it('renders nothing when nobody raised a hand', () => {
    const { container } = setup([], false)

    expect(container).toBeEmptyDOMElement()
  })

  it('lists people in the order they raised their hands', () => {
    setup(['p3', 'p1', 'p2'], false)

    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.querySelector('strong')?.textContent)).toEqual([
      'Cường',
      'An · meetingRoom.you',
      'Bình',
    ])
  })

  it('lets a participant lower only their own hand', async () => {
    const user = userEvent.setup()
    setup(['p2', 'p1'], false)

    expect(screen.queryByRole('button', { name: 'presence.lowerHandOf:Bình' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'presence.lowerHandOf:An' }))

    expect(setHandCalls).toEqual([{ code: 'gm-abcd-efgh', participantId: 'p1', raised: false }])
    expect(lowerCalls).toEqual([])
  })

  it('lets the host lower the hand of anyone', async () => {
    const user = userEvent.setup()
    setup(['p2', 'p3'], true, 'p1')

    await user.click(screen.getByRole('button', { name: 'presence.lowerHandOf:Cường' }))

    expect(lowerCalls).toEqual([{ code: 'gm-abcd-efgh', hostParticipantId: 'p1', targetParticipantId: 'p3' }])
    expect(setHandCalls).toEqual([])
  })

  it('shows the name that comes with the event even for someone in another room', () => {
    setup(['p9'], false)

    expect(screen.getByText('Dung')).toBeInTheDocument()
  })
})
