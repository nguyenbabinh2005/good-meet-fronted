/** Payload of /topic/meetings/{meetingId}/waiting-room (MeetingNotifier.WaitingRoomEvent). */
export type WaitingRoomEvent = {
  displayName: string
  requestedAt: string
  requestId: string
  type: 'REQUESTED' | 'RESOLVED'
}

export type WaitingRequest = Pick<WaitingRoomEvent, 'displayName' | 'requestedAt' | 'requestId'>

/**
 * The backend only pushes changes (it has no endpoint listing pending requests),
 * so the host's list is built from the events received while the room is open.
 */
export const applyWaitingRoomEvent = (requests: WaitingRequest[], event: WaitingRoomEvent): WaitingRequest[] => {
  if (event.type === 'RESOLVED') return requests.filter((request) => request.requestId !== event.requestId)
  if (requests.some((request) => request.requestId === event.requestId)) return requests
  return [...requests, { displayName: event.displayName, requestedAt: event.requestedAt, requestId: event.requestId }]
}
