import {
  isTrackReference,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core'
import { DisconnectReason, Track, type LocalParticipant, type Participant } from 'livekit-client'
import type { MeetingJoin } from '../../entities/meeting/model/types'
import {
  getParticipantVisualTheme,
  type ParticipantVisualTheme,
} from '../../features/meeting-room/lib/participant-visual-theme'
import { initialsOf } from '../../shared/lib/text'

export type ParticipantKind = 'host' | 'guest' | 'member'

export type MeetingParticipant = {
  cameraReference?: TrackReference
  host: boolean
  id: string
  initials: string
  isCameraEnabled: boolean
  isLocal: boolean
  kind: ParticipantKind
  /** Present while the participant has a microphone track: needed to mute it (host action). */
  microphoneSid?: string
  muted: boolean
  name: string
  participant: Participant
  theme: ParticipantVisualTheme
}

/** The backend names LiveKit identities `user_<id>` / `guest_<participantId>` (SessionService). */
export const participantKind = (identity: string, host: boolean): ParticipantKind => {
  if (host) return 'host'
  return identity.startsWith('guest_') ? 'guest' : 'member'
}

export const toMeetingParticipant = (
  cameraReference: TrackReferenceOrPlaceholder,
  meetingSession: MeetingJoin | undefined,
  localParticipant: LocalParticipant,
): MeetingParticipant => {
  const participant = cameraReference.participant
  const isLocal = participant.identity === localParticipant.identity
  // The backend puts `role` in the LiveKit token attributes (LiveKitMediaRoom.issueToken).
  const host = participant.attributes.role === 'HOST' || (isLocal && meetingSession?.role === 'HOST')
  const name = participant.name || participant.identity

  return {
    cameraReference: isTrackReference(cameraReference) ? cameraReference : undefined,
    host,
    id: participant.identity || participant.sid,
    initials: initialsOf(name),
    isCameraEnabled: participant.isCameraEnabled,
    isLocal,
    kind: participantKind(participant.identity, host),
    microphoneSid: participant.getTrackPublication(Track.Source.Microphone)?.trackSid,
    muted: !participant.isMicrophoneEnabled,
    name,
    participant,
    theme: getParticipantVisualTheme(participant.identity, participant.sid),
  }
}

export const visiblePanelParticipants = (participants: MeetingParticipant[], currentParticipant: MeetingParticipant) =>
  participants.length > 0 ? participants : [currentParticipant]

export const updateParticipantTrack = async (
  participant: LocalParticipant,
  track: 'camera' | 'microphone' | 'screen',
  enabled: boolean,
) => {
  const trackUpdates = {
    camera: () => participant.setCameraEnabled(enabled),
    microphone: () => participant.setMicrophoneEnabled(enabled),
    screen: () => participant.setScreenShareEnabled(enabled),
  }

  await trackUpdates[track]()
}

/** Why the media connection closed, as a translation key (none for a normal leave). */
export const disconnectNoticeKey = (reason?: DisconnectReason) => {
  switch (reason) {
    case undefined:
    case DisconnectReason.CLIENT_INITIATED:
      return undefined
    case DisconnectReason.ROOM_DELETED:
      return 'meetingRoom.notices.ended'
    case DisconnectReason.PARTICIPANT_REMOVED:
      return 'meetingRoom.notices.removed'
    case DisconnectReason.DUPLICATE_IDENTITY:
      return 'meetingRoom.notices.duplicate'
    default:
      return 'meetingRoom.notices.disconnected'
  }
}
