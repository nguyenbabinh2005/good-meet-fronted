import { useEffect, useRef, useSyncExternalStore } from 'react'
import { isRealtimeConnected, subscribeRealtime, subscribeRealtimeStatus } from './stomp-client'

/** Subscribes while mounted. Pass `undefined` to stay idle (e.g. data not loaded yet). */
export const useRealtimeSubscription = <T>(destination: string | undefined, handler: (payload: T) => void) => {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!destination) return undefined
    return subscribeRealtime<T>(destination, (payload) => handlerRef.current(payload))
  }, [destination])
}

export const useRealtimeConnected = () =>
  useSyncExternalStore(subscribeRealtimeStatus, isRealtimeConnected, () => false)
