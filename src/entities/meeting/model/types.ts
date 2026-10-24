import type { ParticipantRole } from '../../participant/model/types'

export type MeetingStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'

export type Meeting = {
  assistantEnabled: boolean
  captionsEnabled: boolean
  id: string
  mediaRoomId: string
  notesEnabled: boolean
  publicCode: string
  scheduledEndAt: string | null
  scheduledStartAt: string | null
  status: MeetingStatus
  title: string
}

export type MeetingResponse = Meeting & { participantId?: string }

export type MeetingJoin = {
  displayName: string
  mediaToken: string
  mediaTokenExpiresAt: string
  mediaUrl: string
  meetingId: string
  participantId: string
  publicCode: string
  role: ParticipantRole
}

export type Invitation = {
  createdAt: string
  email: string
  id: string
}

export type MediaRoomChange = {
  breakoutRoomId: string | null
  mediaToken: string
  mediaTokenExpiresAt: string
  mediaUrl: string
  roomName: string | null
  type: 'BREAKOUT' | 'MAIN'
}

export type BreakoutPlacement = {
  id: string
  name: string
}
