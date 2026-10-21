import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the room lobby entry point', async () => {
  render(<App />)
  expect(
    await screen.findByRole('heading', { name: /sẵn sàng cho cuộc họp|look and sound your best/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /tham gia phòng|join meeting/i })).toBeInTheDocument()
})
