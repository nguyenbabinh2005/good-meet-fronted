export type WaitingRoomEvent = {
  displayName: string
  requestedAt: string
  requestId: string
  type: 'REQUESTED' | 'RESOLVED'
}

export type WaitingRequest = Pick<WaitingRoomEvent, 'displayName' | 'requestedAt' | 'requestId'>

export const applyWaitingRoomEvent = (requests: WaitingRequest[], event: WaitingRoomEvent): WaitingRequest[] => {
  if (event.type === 'RESOLVED') return requests.filter((request) => request.requestId !== event.requestId)
  if (requests.some((request) => request.requestId === event.requestId)) return requests
  return [...requests, { displayName: event.displayName, requestedAt: event.requestedAt, requestId: event.requestId }]
}

export const mergeWaitingSnapshot = (snapshot: WaitingRequest[], current: WaitingRequest[]): WaitingRequest[] => {
  const known = new Set(snapshot.map((request) => request.requestId))
  return [...snapshot, ...current.filter((request) => !known.has(request.requestId))].sort((a, b) =>
    a.requestedAt.localeCompare(b.requestedAt),
  )
}
