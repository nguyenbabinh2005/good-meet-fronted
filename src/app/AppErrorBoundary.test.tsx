import { render, screen } from '@testing-library/react'
import { AppErrorBoundary } from './providers/AppErrorBoundary'

const ThrowingChild = () => {
  throw new Error('test error')
}

test('renders fallback UI when a child throws', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  render(
    <AppErrorBoundary>
      <ThrowingChild />
    </AppErrorBoundary>
  )

  expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()

  consoleError.mockRestore()
})
