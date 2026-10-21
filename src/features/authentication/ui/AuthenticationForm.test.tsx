import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthenticationForm } from './AuthenticationForm'

const dispatch = vi.fn()
const login = vi.fn()
const registerAccount = vi.fn()

vi.mock('../../../app/store', () => ({ useAppDispatch: () => dispatch }))
vi.mock('../api/authentication.api', () => ({
  login: (input: unknown) => login(input),
  register: (input: unknown) => registerAccount(input),
}))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

const renderForm = (mode: 'login' | 'register') =>
  render(
    <MemoryRouter initialEntries={['/login?redirectTo=%2Fmeetings']}>
      <AuthenticationForm mode={mode} />
    </MemoryRouter>,
  )

describe('AuthenticationForm', () => {
  beforeEach(() => {
    dispatch.mockReset()
    login.mockReset()
    registerAccount.mockReset()
  })

  it('logs in with a normalised email and stores the returned userId', async () => {
    const user = userEvent.setup()
    login.mockResolvedValue('user-1')
    renderForm('login')

    await user.type(screen.getByLabelText('authentication.email'), '  BILLY@EXAMPLE.COM ')
    await user.type(screen.getByLabelText('authentication.password'), 'secret1')
    await user.click(screen.getByRole('button', { name: /authentication.signIn/ }))

    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'billy@example.com', password: 'secret1' }))
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { displayName: 'billy', email: 'billy@example.com', userId: 'user-1' },
        type: 'auth/signedIn',
      }),
    )
  })

  it('registers, then signs in to obtain the userId and keeps the chosen name', async () => {
    const user = userEvent.setup()
    registerAccount.mockResolvedValue(undefined)
    login.mockResolvedValue('user-2')
    renderForm('register')

    await user.type(screen.getByLabelText('authentication.displayName'), '  Billy Nguyen  ')
    await user.type(screen.getByLabelText('authentication.email'), 'billy@example.com')
    await user.type(screen.getByLabelText('authentication.password'), 'secret1')
    await user.type(screen.getByLabelText('authentication.confirmPassword'), 'secret1')
    await user.click(screen.getByRole('button', { name: /authentication.createAccount/ }))

    await waitFor(() =>
      expect(registerAccount).toHaveBeenCalledWith({
        displayName: 'Billy Nguyen',
        email: 'billy@example.com',
        password: 'secret1',
      }),
    )
    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { displayName: 'Billy Nguyen', email: 'billy@example.com', userId: 'user-2' },
        }),
      ),
    )
  })

  it('does not submit invalid registration data', async () => {
    const user = userEvent.setup()
    renderForm('register')

    await user.click(screen.getByRole('button', { name: /authentication.createAccount/ }))

    expect(await screen.findByText('validation.authentication.displayNameRequired')).toBeInTheDocument()
    expect(registerAccount).not.toHaveBeenCalled()
  })

  it('shows a translated message when the server rejects the credentials', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue(new Error('boom'))
    renderForm('login')

    await user.type(screen.getByLabelText('authentication.email'), 'billy@example.com')
    await user.type(screen.getByLabelText('authentication.password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /authentication.signIn/ }))

    expect(await screen.findByText('authentication.errors.unavailable')).toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('toggles password visibility without submitting', async () => {
    const user = userEvent.setup()
    renderForm('register')

    const password = screen.getByLabelText('authentication.password')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'authentication.showPassword' }))

    expect(password).toHaveAttribute('type', 'text')
    expect(login).not.toHaveBeenCalled()
  })
})
