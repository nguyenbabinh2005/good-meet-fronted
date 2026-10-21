import { readStorage, writeStorage } from '../../../shared/lib/storage'
import type { StoredMeeting } from './my-meetings.slice'

const keyOf = (userId: string) => `good-meet.meetings.${userId}`

export const readMeetings = (userId: string) => {
  const items = readStorage<StoredMeeting[]>(keyOf(userId), [])
  return Array.isArray(items) ? items : []
}

export const writeMeetings = (userId: string, items: StoredMeeting[]) => writeStorage(keyOf(userId), items)
