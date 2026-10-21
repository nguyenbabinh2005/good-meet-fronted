import { DisconnectReason, type LocalParticipant } from 'livekit-client'
import { describe, expect, it, vi } from 'vitest'
import type { MeetingJoin } from '../../entities/meeting/model/types'
import {
  disconnectNoticeKey,
  participantKind,
  toMeetingParticipant,
  updateParticipantTrack,
  visiblePanelParticipants,
} from './meeting-room.helpers'

const session: MeetingJoin = {
  displayName: 'Guest User',
  mediaToken: 'media-token',
  mediaTokenExpiresAt: '2026-10-20T10:10:00Z',
  mediaUrl: 'ws://localhost:7880',
  meetingId: 'meeting-id',
  participantId: 'participant-id',
  publicCode: 'gm-abcd-efgh',
  role: 'HOST',
}

describe('meeting room participant helpers', () => {
  it('uses connected participants when the participant list is available', () => {
    const participants = [{ id: 'remote-participant' }]
    const currentParticipant = { id: 'local-participant' }

    expect(visiblePanelParticipants(participants as never[], currentParticipant as never)).toBe(participants)
  })

  it('falls back to the current participant while LiveKit tracks are loading', () => {
    const currentParticipant = { id: 'local-participant' }

    expect(visiblePanelParticipants([], currentParticipant as never)).toEqual([currentParticipant])
  })

  it('maps a LiveKit camera placeholder to the stable participant view model', () => {
    const participant = {
      attributes: { role: 'PARTICIPANT' },
      getTrackPublication: () => ({ trackSid: 'TR_mic' }),
      identity: 'guest_123',
      isCameraEnabled: false,
      isMicrophoneEnabled: false,
      name: 'Guest User',
      sid: 'participant-sid',
    }
    const localParticipant = { identity: 'guest_123' }

    const result = toMeetingParticipant({ participant } as never, session, localParticipant as LocalParticipant)

    expect(result).toMatchObject({
      cameraReference: undefined,
      host: true,
      id: 'guest_123',
      initials: 'GU',
      isCameraEnabled: false,
      isLocal: true,
      kind: 'host',
      microphoneSid: 'TR_mic',
      muted: true,
      name: 'Guest User',
      participant,
    })
    expect(result.theme).toBeDefined()
  })

  it('trusts the role attribute of remote participants', () => {
    const participant = {
      attributes: { role: 'HOST' },
      getTrackPublication: () => undefined,
      identity: 'user_1',
      isCameraEnabled: true,
      isMicrophoneEnabled: true,
      name: 'Chủ phòng',
      sid: 'sid',
    }

    const result = toMeetingParticipant({ participant } as never, { ...session, role: 'PARTICIPANT' }, {
      identity: 'user_2',
    } as LocalParticipant)

    expect(result).toMatchObject({ host: true, isLocal: false, kind: 'host' })
  })

  it.each([
    ['user_abc', false, 'member'],
    ['guest_abc', false, 'guest'],
    ['guest_abc', true, 'host'],
  ] as const)('labels identity %s (host=%s) as %s', (identity, host, expected) => {
    expect(participantKind(identity, host)).toBe(expected)
  })

  it.each([
    ['camera', 'setCameraEnabled'],
    ['microphone', 'setMicrophoneEnabled'],
    ['screen', 'setScreenShareEnabled'],
  ] as const)('updates the %s publication through LiveKit', async (track, method) => {
    const participant = {
      setCameraEnabled: vi.fn().mockResolvedValue(undefined),
      setMicrophoneEnabled: vi.fn().mockResolvedValue(undefined),
      setScreenShareEnabled: vi.fn().mockResolvedValue(undefined),
    }

    await updateParticipantTrack(participant as unknown as LocalParticipant, track, true)

    expect(participant[method]).toHaveBeenCalledWith(true)
  })
})

describe('disconnectNoticeKey', () => {
  it('stays silent when the user leaves on purpose', () => {
    expect(disconnectNoticeKey(DisconnectReason.CLIENT_INITIATED)).toBeUndefined()
    expect(disconnectNoticeKey(undefined)).toBeUndefined()
  })

  it('explains a closed room and a removed participant', () => {
    expect(disconnectNoticeKey(DisconnectReason.ROOM_DELETED)).toBe('meetingRoom.notices.ended')
    expect(disconnectNoticeKey(DisconnectReason.PARTICIPANT_REMOVED)).toBe('meetingRoom.notices.removed')
  })
})
