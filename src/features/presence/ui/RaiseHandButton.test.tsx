import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import presenceReducer, { handsChanged } from '../model/presence.slice'
import { RaiseHandButton } from './RaiseHandButton'

const calls: unknown[] = []

vi.mock('../api/presence.api', () => ({
  useSetHandMutation: () => ({
    isPending: false,
    mutate: (input: unknown) => {
      calls.push(input)
    },
  }),
}))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

const setup = (raisedIds: string[]) => {
  const store = configureStore({ reducer: { presence: presenceReducer } })
  store.dispatch(handsChanged(raisedIds.map((participantId) => ({ displayName: participantId, participantId }))))
  render(
    <Provider store={store}>
      <RaiseHandButton activeClassName="is-active" code="gm-abcd-efgh" participantId="p1" />
    </Provider>,
  )
}

describe('RaiseHandButton', () => {
  beforeEach(() => {
    calls.length = 0
  })

  it('raises the hand when it is down', async () => {
    const user = userEvent.setup()
    setup([])

    const button = screen.getByRole('button', { name: 'presence.raiseHand' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)

    expect(calls).toEqual([{ code: 'gm-abcd-efgh', participantId: 'p1', raised: true }])
  })

  it('lowers the hand when it is raised and marks the button active', async () => {
    const user = userEvent.setup()
    setup(['p2', 'p1'])

    const button = screen.getByRole('button', { name: 'presence.lowerHand' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveClass('is-active')
    await user.click(button)

    expect(calls).toEqual([{ code: 'gm-abcd-efgh', participantId: 'p1', raised: false }])
  })
})
