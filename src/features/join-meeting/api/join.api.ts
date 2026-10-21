import { apiRequestWithStatus } from '../../../shared/api/api-client'
import type { MeetingJoin } from '../../../entities/meeting/model/types'

export type JoinMeetingInput = { code: string; displayName: string; userId?: string }

export type JoinOutcome = { join: MeetingJoin; kind: 'joined' } | { kind: 'waiting'; requestId: string }

/**
 * POST /meetings/{code}/join
 *  - 200 + join result: the host (or anyone admitted) goes straight into the room
 *  - 202 + { requestId }: the waiting room is always on, so the host must approve first
 */
export const joinMeeting = async ({ code, displayName, userId }: JoinMeetingInput): Promise<JoinOutcome> => {
  const { data, status } = await apiRequestWithStatus<MeetingJoin | { requestId: string }>({
    data: { displayName, userId },
    method: 'POST',
    url: `/meetings/${encodeURIComponent(code)}/join`,
  })
  return status === 202
    ? { kind: 'waiting', requestId: (data as { requestId: string }).requestId }
    : { join: data as MeetingJoin, kind: 'joined' }
}
