import {
  Camera,
  CameraOff,
  Link2,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  Power,
  PhoneOff,
  ShieldCheck,
  Users,
  X,
  DoorClosed,
} from 'lucide-react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react'
import { ConnectionState, Track } from 'livekit-client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { useEndMeetingMutation, useEndSessionMutation } from '../../entities/meeting/api/meeting.api'
import { meetingSessionCleared } from '../../entities/meeting/model/meeting-session.slice'
import { meetingLink } from '../../entities/meeting/model/meeting-status'
import { meetingSaved } from '../../entities/meeting/model/my-meetings.slice'
import type { MeetingJoin } from '../../entities/meeting/model/types'
import { ChatPanel, useMeetingChat } from '../../features/meeting-chat'
import { getParticipantVisualTheme } from '../../features/meeting-room/lib/participant-visual-theme'
import { useSpeakingGlow } from '../../features/meeting-room/lib/use-speaking-glow'
import { panelClosed, panelToggled } from '../../features/meeting-room/model/meeting-room-ui.slice'
import { ParticipantsPanel, type PanelParticipant } from '../../features/meeting-room/ui/ParticipantsPanel'
import participantVisualStyles from '../../features/meeting-room/ui/ParticipantVisualTile.module.scss'
import {
  useKickParticipantMutation,
  useMuteParticipantMutation,
  useWaitingRoom,
  WaitingRoomList,
} from '../../features/manage-participant'
import { useCopyFeedback } from '../../shared/hooks'
import { initialsOf } from '../../shared/lib/text'
import styles from './MeetingRoomPage.module.scss'
import {
  disconnectNoticeKey,
  participantKind,
  toMeetingParticipant,
  updateParticipantTrack,
  visiblePanelParticipants,
  type MeetingParticipant,
} from './meeting-room.helpers'

type RemoteParticipantTileProps = { meetingParticipant: MeetingParticipant }

const RemoteParticipantTile = ({ meetingParticipant }: RemoteParticipantTileProps) => {
  const tileRef = useRef<HTMLElement>(null)
  const isSpeaking = useIsSpeaking(meetingParticipant.participant)

  useSpeakingGlow({ elementRef: tileRef, participant: meetingParticipant.participant })

  return (
    <article
      className={`${participantVisualStyles.participantTile} ${!meetingParticipant.isCameraEnabled ? participantVisualStyles.participantTileCameraOff : ''}`}
      data-speaking={isSpeaking}
      ref={tileRef}
      style={
        {
          '--participant-accent': meetingParticipant.theme.accent,
          '--participant-avatar': meetingParticipant.theme.avatarBackground,
          '--participant-background': meetingParticipant.theme.tileBackground,
          '--participant-foreground': meetingParticipant.theme.foreground,
          '--participant-glow': meetingParticipant.theme.glow,
        } as CSSProperties
      }
    >
      {meetingParticipant.cameraReference && meetingParticipant.isCameraEnabled && (
        <VideoTrack className={participantVisualStyles.remoteVideo} trackRef={meetingParticipant.cameraReference} />
      )}
      <span
        className={`${participantVisualStyles.avatar} ${meetingParticipant.isCameraEnabled ? participantVisualStyles.avatarHidden : ''}`}
      >
        {meetingParticipant.initials}
      </span>
      <div className={participantVisualStyles.remoteMeta}>
        <strong>{meetingParticipant.name}</strong>
        <span>{meetingParticipant.muted ? <MicOff size={14} /> : <Mic size={14} />}</span>
      </div>
    </article>
  )
}

type MeetingRoomContentProps = { connectionError: string | null; session: MeetingJoin }

const MeetingRoomContent = ({ connectionError, session }: MeetingRoomContentProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const panel = useAppSelector((state) => state.meetingRoomUi.panel)
  const { cameraTrack, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled, localParticipant } =
    useLocalParticipant()
  const isLocalParticipantSpeaking = useIsSpeaking(localParticipant)
  const connectionState = useConnectionState()
  const cameraReferences = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }])
  const speakerTileRef = useRef<HTMLDivElement>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)
  const [pendingTrack, setPendingTrack] = useState<'camera' | 'microphone' | 'screen' | null>(null)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [seenIncoming, setSeenIncoming] = useState(0)
  const { copied, copy } = useCopyFeedback()

  const isHost = session.role === 'HOST'
  const waitingRequests = useWaitingRoom(session.meetingId, isHost)
  const chat = useMeetingChat({
    code: session.publicCode,
    meetingId: session.meetingId,
    participantId: session.participantId,
  })
  const kickMutation = useKickParticipantMutation()
  const muteMutation = useMuteParticipantMutation()
  const endSessionMutation = useEndSessionMutation()
  const endMeetingMutation = useEndMeetingMutation()

  const isConnected = connectionState === ConnectionState.Connected
  const microphoneEnabled = isConnected && isMicrophoneEnabled
  const cameraEnabled = isConnected && isCameraEnabled
  const participants = cameraReferences.map((cameraReference) =>
    toMeetingParticipant(cameraReference, session, localParticipant),
  )
  const localIdentity = localParticipant.identity || `user_${session.participantId}`
  const currentParticipant: MeetingParticipant = {
    ...(participants.find((participant) => participant.isLocal) ?? {
      cameraReference: undefined,
      host: isHost,
      id: localIdentity,
      initials: initialsOf(session.displayName),
      isCameraEnabled: cameraEnabled,
      isLocal: true,
      kind: participantKind(localIdentity, isHost),
      muted: !microphoneEnabled,
      name: session.displayName,
      participant: localParticipant,
      theme: getParticipantVisualTheme(localIdentity, localParticipant.sid || 'local'),
    }),
  }
  const remoteParticipants = participants.filter((participant) => !participant.isLocal)
  const unreadMessages = panel === 'chat' ? 0 : Math.max(0, chat.incomingCount - seenIncoming)

  useSpeakingGlow({ elementRef: speakerTileRef, participant: localParticipant })

  useEffect(() => {
    if (panel === 'chat') setSeenIncoming(chat.incomingCount)
  }, [panel, chat.incomingCount])

  useEffect(() => {
    const publishedCameraTrack = cameraTrack?.track
    const videoElement = videoElementRef.current
    if (!isConnected || !publishedCameraTrack || !videoElement) return

    publishedCameraTrack.attach(videoElement)
    return () => {
      publishedCameraTrack.detach(videoElement)
    }
  }, [cameraTrack, isConnected])

  const toggleLocalTrack = async (track: 'camera' | 'microphone' | 'screen') => {
    if (pendingTrack) return

    setTrackError(null)
    setPendingTrack(track)
    try {
      if (!isConnected) throw new Error(t('meetingRoom.stillConnecting'))

      const nextTrackState = {
        camera: !isCameraEnabled,
        microphone: !isMicrophoneEnabled,
        screen: !isScreenShareEnabled,
      }

      await updateParticipantTrack(localParticipant, track, nextTrackState[track])
    } catch (error) {
      setTrackError(error instanceof Error ? error.message : t('meetingRoom.trackError'))
    } finally {
      setPendingTrack(null)
    }
  }

  const leaveMeeting = () => {
    dispatch(meetingSessionCleared())
    void navigate('/')
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.()
  }

  const hostAction = async (action: () => Promise<unknown>, confirmKey: string) => {
    setMenuOpen(false)
    setActionError(null)
    if (!window.confirm(t(confirmKey))) return
    try {
      await action()
    } catch {
      setActionError(t('meetingRoom.actionFailed'))
    }
  }

  const endSession = () =>
    hostAction(
      () => endSessionMutation.mutateAsync({ code: session.publicCode, participantId: session.participantId }),
      'meetingRoom.confirmEndSession',
    )

  const endMeeting = () =>
    hostAction(async () => {
      dispatch(
        meetingSaved(
          await endMeetingMutation.mutateAsync({ code: session.publicCode, participantId: session.participantId }),
        ),
      )
    }, 'meetingRoom.confirmEndMeeting')

  const kickParticipant = async (participant: PanelParticipant) => {
    setActionError(null)
    if (!window.confirm(t('meetingRoom.confirmKick', { name: participant.name }))) return
    try {
      await kickMutation.mutateAsync({
        code: session.publicCode,
        hostParticipantId: session.participantId,
        identity: participant.id,
      })
    } catch {
      setActionError(t('meetingRoom.actionFailed'))
    }
  }

  const muteParticipant = async (participant: PanelParticipant) => {
    if (!participant.microphoneSid) return
    setActionError(null)
    try {
      await muteMutation.mutateAsync({
        code: session.publicCode,
        hostParticipantId: session.participantId,
        identity: participant.id,
        trackSid: participant.microphoneSid,
      })
    } catch {
      setActionError(t('meetingRoom.actionFailed'))
    }
  }

  const panelParticipants: PanelParticipant[] = visiblePanelParticipants(participants, currentParticipant).map(
    (participant) => ({
      avatarColor: participant.theme.avatarBackground,
      id: participant.id,
      initials: participant.initials,
      isLocal: participant.isLocal,
      kind: participant.kind,
      microphoneSid: participant.microphoneSid,
      muted: participant.muted,
      name: participant.name,
    }),
  )
  const participantCount = Math.max(participants.length, 1)

  return (
    <section className={`${styles.room} meeting-room-page`} aria-label={t('meetingRoom.title')}>
      <header className={styles.topbar}>
        <div className={styles.roomIdentity}>
          <span className={styles.brandMark}>
            <Camera size={19} />
          </span>
          <div>
            <strong>{session.publicCode}</strong>
            <button
              className={styles.copyLink}
              onClick={() => void copy(meetingLink(session.publicCode))}
              type="button"
            >
              <Link2 size={12} /> {copied ? t('meetingRoom.linkCopied') : t('meetingRoom.copyLink')}
            </button>
          </div>
        </div>

        <div className={styles.sessionStatus}>
          <span>
            <i /> {t('meetingRoom.live')}
          </span>
          <span className={styles.secure}>
            <ShieldCheck size={15} /> {t('meetingRoom.secure')}
          </span>
        </div>

        <div className={styles.topActions}>
          <button
            aria-label={t('meetingRoom.participants')}
            className={panel === 'participants' ? styles.activeAction : ''}
            onClick={() => dispatch(panelToggled('participants'))}
            type="button"
          >
            <Users size={18} />
            <span>{participantCount}</span>
            {waitingRequests.length > 0 && (
              <b aria-label={t('meetingRoom.waitingBadge', { count: waitingRequests.length })} className={styles.badge}>
                {waitingRequests.length}
              </b>
            )}
          </button>
          <button
            aria-label={t('meetingRoom.chat')}
            className={panel === 'chat' ? styles.activeAction : ''}
            onClick={() => dispatch(panelToggled('chat'))}
            type="button"
          >
            <MessageSquare size={18} />
            <span>{t('meetingRoom.chat')}</span>
            {unreadMessages > 0 && (
              <b aria-label={t('meetingRoom.unreadBadge', { count: unreadMessages })} className={styles.badge}>
                {unreadMessages}
              </b>
            )}
          </button>
          <button aria-label={t('meetingRoom.fullscreen')} onClick={toggleFullscreen} type="button">
            <Maximize2 size={18} />
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        {(connectionError || actionError || trackError) && (
          <p className={styles.connectionError} role="alert">
            {connectionError ? t('meetingRoom.connectionError') : (actionError ?? trackError)}
          </p>
        )}
        <main className={`${styles.stage} ${remoteParticipants.length === 0 ? styles.stageSolo : ''}`}>
          <div
            className={styles.speakerTile}
            data-speaking={isLocalParticipantSpeaking}
            ref={speakerTileRef}
            style={{ '--participant-accent': currentParticipant.theme.accent } as CSSProperties}
          >
            <video
              autoPlay
              className={cameraEnabled ? styles.localVideoVisible : styles.localVideo}
              muted
              playsInline
              ref={videoElementRef}
            />
            <span
              className={`${styles.largeAvatar} ${cameraEnabled ? styles.avatarHidden : ''}`}
              style={{ '--avatar-color': currentParticipant.theme.avatarBackground } as CSSProperties}
            >
              {currentParticipant.initials}
            </span>
            <div className={styles.tileMeta}>
              <span>
                {currentParticipant.name} · {t('meetingRoom.you')}
              </span>
              {isLocalParticipantSpeaking && (
                <span className={styles.speaking}>
                  <i /> {t('meetingRoom.speaking')}
                </span>
              )}
            </div>
          </div>

          {remoteParticipants.length > 0 && (
            <div className={styles.participantStrip}>
              {remoteParticipants.map((participant) => (
                <RemoteParticipantTile key={participant.id} meetingParticipant={participant} />
              ))}
            </div>
          )}

          <div className={styles.controlDock} aria-label={t('meetingRoom.controls')}>
            <button
              aria-pressed={microphoneEnabled}
              className={!microphoneEnabled ? styles.controlOff : ''}
              disabled={!isConnected || pendingTrack !== null}
              onClick={() => void toggleLocalTrack('microphone')}
              type="button"
            >
              {microphoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              <span>{t('meetingRoom.microphone')}</span>
            </button>
            <button
              aria-pressed={cameraEnabled}
              className={!cameraEnabled ? styles.controlOff : ''}
              disabled={!isConnected || pendingTrack !== null}
              onClick={() => void toggleLocalTrack('camera')}
              type="button"
            >
              {cameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
              <span>{t('meetingRoom.camera')}</span>
            </button>
            <button
              aria-pressed={isScreenShareEnabled}
              className={isScreenShareEnabled ? styles.controlActive : ''}
              disabled={!isConnected || pendingTrack !== null}
              onClick={() => void toggleLocalTrack('screen')}
              type="button"
            >
              <MonitorUp size={20} />
              <span>{t('meetingRoom.share')}</span>
            </button>
            {isHost && (
              <div className={styles.moreWrap}>
                <button
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  <MoreHorizontal size={20} />
                  <span>{t('meetingRoom.more')}</span>
                </button>
                {menuOpen && (
                  <div className={styles.menu} role="menu">
                    <button onClick={() => void endSession()} role="menuitem" type="button">
                      <DoorClosed size={16} /> {t('meetingRoom.endSession')}
                    </button>
                    <button className={styles.menuDanger} onClick={() => void endMeeting()} role="menuitem" type="button">
                      <Power size={16} /> {t('meetingRoom.endMeeting')}
                    </button>
                  </div>
                )}
              </div>
            )}
            <button className={styles.leaveButton} onClick={leaveMeeting} type="button">
              <PhoneOff size={20} />
              <span>{t('meetingRoom.leave')}</span>
            </button>
          </div>
        </main>

        {panel && (
          <aside className={styles.sidePanel}>
            <div className={styles.panelHeading}>
              <div>
                <p>{panel === 'chat' ? t('meetingRoom.chat') : t('meetingRoom.participants')}</p>
                <span>
                  {participantCount} {t('meetingRoom.inCall')}
                </span>
              </div>
              <button aria-label={t('meetingRoom.closePanel')} onClick={() => dispatch(panelClosed())} type="button">
                <X size={18} />
              </button>
            </div>
            {panel === 'chat' ? (
              <ChatPanel
                connected={chat.connected}
                currentParticipantId={session.participantId}
                historyFailed={chat.historyFailed}
                loading={chat.loading}
                messages={chat.messages}
                onSend={chat.send}
                sendFailed={chat.sendFailed}
              />
            ) : (
              <ParticipantsPanel
                isHost={isHost}
                onKick={(participant) => void kickParticipant(participant)}
                onMute={(participant) => void muteParticipant(participant)}
                participants={panelParticipants}
              >
                {isHost && <WaitingRoomList hostParticipantId={session.participantId} requests={waitingRequests} />}
              </ParticipantsPanel>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

const MeetingRoomPage = () => {
  const { meetingId: routeCode = '' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.meetingSession.current)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // After a refresh the in-memory session (and its short-lived token) is gone: go back through the join flow.
  if (!session || session.publicCode !== routeCode.toLowerCase()) {
    return <Navigate replace to={`/join?code=${encodeURIComponent(routeCode)}`} />
  }

  return (
    <LiveKitRoom
      audio={false}
      className={styles.liveKitRoot}
      connect
      data-lk-theme="default"
      onConnected={() => setConnectionError(null)}
      onDisconnected={(reason) => {
        const notice = disconnectNoticeKey(reason)
        if (!notice) return
        dispatch(meetingSessionCleared())
        void navigate('/', { replace: true, state: { notice } })
      }}
      onError={(error) => setConnectionError(error.message)}
      serverUrl={session.mediaUrl}
      token={session.mediaToken}
      video={false}
    >
      <MeetingRoomContent connectionError={connectionError} session={session} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}

export default MeetingRoomPage
