import { useEffect, useMemo, useRef, useState } from 'react'
import { publishRealtime, useRealtimeConnected, useRealtimeSubscription } from '../../../shared/realtime'
import { useChatHistoryQuery } from '../api/chat.api'
import { mergeMessages } from './merge-messages'
import type { ChatMessage } from './types'

/** How long to wait for our own message to come back before reporting a failure. */
const ECHO_TIMEOUT_MS = 4_000

type UseMeetingChatOptions = { code: string; meetingId: string; participantId: string }

/**
 * History over REST, live messages over STOMP.
 *
 * Over STOMP the backend does not answer a rejected message (for example when the
 * meeting has no active session yet): the broadcast of our own message is the only
 * confirmation, so a message that never echoes is reported as failed.
 */
export const useMeetingChat = ({ code, meetingId, participantId }: UseMeetingChatOptions) => {
  const history = useChatHistoryQuery(code, participantId)
  const connected = useRealtimeConnected()
  const [live, setLive] = useState<ChatMessage[]>([])
  const [sendFailed, setSendFailed] = useState(false)
  const [incomingCount, setIncomingCount] = useState(0)
  const awaitingEcho = useRef<Array<{ content: string; timer: ReturnType<typeof setTimeout> }>>([])

  useRealtimeSubscription<ChatMessage>(`/topic/meetings/${meetingId}/chat`, (message) => {
    setLive((current) => mergeMessages(current, [message]))
    if (message.senderParticipantId !== participantId) {
      setIncomingCount((count) => count + 1)
      return
    }
    const index = awaitingEcho.current.findIndex((entry) => entry.content === message.content)
    if (index === -1) return
    clearTimeout(awaitingEcho.current[index].timer)
    awaitingEcho.current.splice(index, 1)
    setSendFailed(false)
  })

  useEffect(() => {
    const pending = awaitingEcho.current
    return () => pending.forEach((entry) => clearTimeout(entry.timer))
  }, [])

  const messages = useMemo(() => mergeMessages(history.data ?? [], live), [history.data, live])

  const send = (content: string) => {
    const text = content.trim()
    if (!text) return false
    try {
      publishRealtime(`/app/meetings/${encodeURIComponent(code)}/chat`, { content: text, participantId })
    } catch {
      setSendFailed(true)
      return false
    }
    const timer = setTimeout(() => setSendFailed(true), ECHO_TIMEOUT_MS)
    awaitingEcho.current.push({ content: text, timer })
    return true
  }

  return {
    connected,
    historyFailed: history.isError,
    /** Live messages from other people since the room opened (drives the unread badge). */
    incomingCount,
    loading: history.isLoading,
    messages,
    send,
    sendFailed,
  }
}
