export type BreakoutMember = {
  displayName: string
  participantId: string
}

export type BreakoutRoom = {
  id: string
  name: string
  participants: BreakoutMember[]
}

export type BreakoutRoomView = {
  createdAt: string
  id: string
  meetingId: string
  name: string
}

export type BreakoutChangedEvent = {
  meetingId: string
  rooms: BreakoutRoom[]
}

export type AssignableParticipant = {
  id: string
  name: string
}
