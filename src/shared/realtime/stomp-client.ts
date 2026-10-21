import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { env } from '../config/env'

type Entry = {
  destination: string
  handler: (message: IMessage) => void
  subscription?: StompSubscription
}

const IDLE_DISCONNECT_MS = 1_000

let client: Client | undefined
let connected = false
let idleTimer: ReturnType<typeof setTimeout> | undefined
const entries = new Set<Entry>()
const statusListeners = new Set<() => void>()

const setConnected = (value: boolean) => {
  if (connected === value) return
  connected = value
  statusListeners.forEach((listener) => listener())
}

const attach = (entry: Entry) => {
  entry.subscription = client?.subscribe(entry.destination, entry.handler)
}

const getStompClient = () => {
  if (!client) {
    client = new Client({
      brokerURL: env.socketUrl,
      heartbeatIncoming: 4_000,
      heartbeatOutgoing: 4_000,
      reconnectDelay: 5_000,
    })
    // Fires on the first connection and on every automatic reconnection.
    client.onConnect = () => {
      setConnected(true)
      entries.forEach(attach)
    }
    client.onWebSocketClose = () => {
      setConnected(false)
      entries.forEach((entry) => {
        entry.subscription = undefined
      })
    }
  }
  return client
}

const disconnectWhenIdle = () => {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    if (entries.size === 0) void disconnectRealtime()
  }, IDLE_DISCONNECT_MS)
}

/**
 * Subscribes to a STOMP destination. Safe to call before the socket is open:
 * the subscription is attached as soon as the connection is established, and
 * re-attached after a reconnect. Returns an unsubscribe function.
 */
export const subscribeRealtime = <T>(destination: string, handler: (payload: T) => void) => {
  clearTimeout(idleTimer)
  const entry: Entry = {
    destination,
    handler: (message) => {
      try {
        handler(JSON.parse(message.body) as T)
      } catch (error) {
        console.error('Ignoring malformed realtime payload', error)
      }
    },
  }
  entries.add(entry)

  const stompClient = getStompClient()
  if (connected) attach(entry)
  if (!stompClient.active) stompClient.activate()

  return () => {
    entry.subscription?.unsubscribe()
    entries.delete(entry)
    if (entries.size === 0) disconnectWhenIdle()
  }
}

export const publishRealtime = (destination: string, body: unknown) => {
  if (!client || !connected) throw new Error('Realtime connection is not ready')
  client.publish({ body: JSON.stringify(body), destination })
}

export const isRealtimeConnected = () => connected

export const subscribeRealtimeStatus = (listener: () => void) => {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}

export const disconnectRealtime = async () => {
  clearTimeout(idleTimer)
  const stompClient = client
  client = undefined
  entries.forEach((entry) => {
    entry.subscription = undefined
  })
  setConnected(false)
  await stompClient?.deactivate()
}
