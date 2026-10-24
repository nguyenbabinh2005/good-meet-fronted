import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import presenceReducer from './presence.slice'
import { useHands } from './use-hands'

let deliver: (payload: unknown) => void = () => {}
let topic: string | undefined
let snapshot: { meetingId: string; raisedParticipants: { displayName: string; participantId: string }[] }

vi.mock('../../../shared/realtime', () => ({
  useRealtimeSubscription: (destination: string | undefined, handler: (payload: unknown) => void) => {
    topic = destination
    deliver = handler
  },
}))
vi.mock('../api/presence.api', async () => {
  const { useQuery } = await import('@tanstack/react-query')
  return {
    useHandsQuery: () => useQuery({ queryFn: () => Promise.resolve(snapshot), queryKey: ['hands'] }),
  }
})

const an = { displayName: 'An', participantId: 'p1' }
const binh = { displayName: 'Bình', participantId: 'p2' }

const setup = () => {
  const store = configureStore({ reducer: { presence: presenceReducer } })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </Provider>
  )
  renderHook(() => useHands({ code: 'gm-abcd-efgh', meetingId: 'm1', participantId: 'p1' }), { wrapper })
  return store
}

describe('useHands', () => {
  beforeEach(() => {
    snapshot = { meetingId: 'm1', raisedParticipants: [an] }
  })

  it('listens on the hands topic of the meeting', () => {
    setup()

    expect(topic).toBe('/topic/meetings/m1/hands')
  })

  it('loads the hands that were already raised when joining late', async () => {
    const store = setup()

    await waitFor(() => expect(store.getState().presence.raised).toEqual([an]))
  })

  it('applies live changes with the names sent by the server', async () => {
    const store = setup()
    await waitFor(() => expect(store.getState().presence.raised).toEqual([an]))

    act(() => deliver({ meetingId: 'm1', participantId: 'p2', raised: true, raisedParticipants: [an, binh] }))

    expect(store.getState().presence.raised).toEqual([an, binh])
  })

  it('does not let a late snapshot overwrite a newer live change', async () => {
    const store = setup()
    act(() => deliver({ meetingId: 'm1', participantId: 'p2', raised: true, raisedParticipants: [binh] }))

    await act(async () => {
      await Promise.resolve()
    })

    await waitFor(() => expect(store.getState().presence.raised).toEqual([binh]))
  })
})
