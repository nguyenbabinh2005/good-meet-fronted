import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HandBadge } from './HandBadge'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

describe('HandBadge', () => {
  it('shows a plain hand icon when the hand is raised', () => {
    render(<HandBadge raised />)

    const icon = screen.getByRole('img', { name: 'presence.handRaised' })
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveTextContent('')
  })

  it('renders nothing when the hand is down', () => {
    const { container } = render(<HandBadge />)

    expect(container).toBeEmptyDOMElement()
  })
})
