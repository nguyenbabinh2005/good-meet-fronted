import { readStorage, writeStorage } from '../../../shared/lib/storage'

const keyOf = (userId: string) => `good-meet.host-participants.${userId}`

export const readHostParticipants = (userId: string) => {
  const stored = readStorage<Record<string, string>>(keyOf(userId), {})
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

export const writeHostParticipants = (userId: string, byCode: Record<string, string>) =>
  writeStorage(keyOf(userId), byCode)
