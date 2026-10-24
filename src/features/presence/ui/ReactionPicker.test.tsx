import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { REACTION_EMOJIS } from '../model/reactions.ts'
import { ReactionPicker } from './ReactionPicker.tsx'

const calls: unknown[] = []

vi.mock('../api/presence.api', () => ({
  useSendReactionMutation: () => ({
    mutate: (input: unknown) => {
      calls.push(input)
    },
  }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => (values?.emoji ? `${key}:${values.emoji}` : key) }),
}))

describe('ReactionPicker', () => {
  beforeEach(() => {
    calls.length = 0
  })

  it('opens the palette and sends the chosen emoji', async () => {
    const user = userEvent.setup()
    render(<ReactionPicker code="gm-abcd-efgh" participantId="p1" />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /presence.react/ }))
    expect(screen.getAllByRole('menuitem')).toHaveLength(REACTION_EMOJIS.length)

    await user.click(screen.getByRole('menuitem', { name: 'presence.sendReaction:👏' }))

    expect(calls).toEqual([{ code: 'gm-abcd-efgh', emoji: '👏', participantId: 'p1' }])
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
