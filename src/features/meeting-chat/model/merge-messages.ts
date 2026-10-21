import type { ChatMessage } from './types'

/** Union by id (history and live pushes overlap), oldest first. */
export const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
  const byId = new Map<string, ChatMessage>()
  for (const message of [...existing, ...incoming]) byId.set(message.id, message)
  return [...byId.values()].sort((a, b) => a.sentAt.localeCompare(b.sentAt) || a.id.localeCompare(b.id))
}
