import type { ParticipantRole } from '../../participant/model/types'

export type MeetingStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'

/** `MeetingInfo` returned by the backend. */
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

/** Create/schedule responses. `participantId` is optional: the current backend does not return it. */
export type MeetingResponse = Meeting & { participantId?: string }

/** `JoinService.JoinResult`: everything a client needs to enter the room. */
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
