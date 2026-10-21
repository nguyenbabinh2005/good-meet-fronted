import {
  ArrowRight,
  Camera,
  CameraOff,
  CalendarPlus,
  Hash,
  Mic,
  MicOff,
  MonitorUp,
  Plus,
  Settings2,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react'
import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/store'
import { useCreateMeeting } from '../../features/create-meeting'
import { normalizeMeetingCode, useEnterMeeting } from '../../features/join-meeting'
import { Button } from '../../shared/ui/button'
import { filterMeetings, MeetingList } from '../../widgets/meeting-list'

const HomePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const myMeetings = useAppSelector((state) => state.myMeetings.items)
  const { create, isPending: isCreating } = useCreateMeeting()
  const { enter, errorKey, isPending: isJoining } = useEnterMeeting()
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [roomId, setRoomId] = useState('')
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false)
  const [mediaError, setMediaError] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const isSubmitting = isCreating || isJoining
  const notice = (location.state as { notice?: string } | null)?.notice
  const upcoming = filterMeetings([...myMeetings], 'UPCOMING').slice(0, 3)

  useEffect(
    () => () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  const updateMediaTrack = async (kind: 'audio' | 'video', enabled: boolean) => {
    const currentStream = mediaStreamRef.current ?? new MediaStream()
    const currentTracks = currentStream.getTracks().filter((track) => track.kind === kind)
    const setEnabled = kind === 'audio' ? setMicrophoneEnabled : setCameraEnabled

    if (!enabled) {
      currentTracks.forEach(track => {
        track.stop()
        currentStream.removeTrack(track)
      })
      setEnabled(false)
      return
    }

    try {
      const capturedStream = await navigator.mediaDevices.getUserMedia({
        audio: kind === 'audio',
        video: kind === 'video',
      })
      const capturedTrack = capturedStream.getTracks().find((track) => track.kind === kind)

      if (!capturedTrack) {
        throw new Error(`No ${kind} track was captured`)
      }

      currentTracks.forEach(track => {
        track.stop()
        currentStream.removeTrack(track)
      })
      capturedStream.getTracks().filter((track) => track !== capturedTrack).forEach((track) => track.stop())
      currentStream.addTrack(capturedTrack)
      mediaStreamRef.current = currentStream

      if (kind === 'video' && videoRef.current?.srcObject !== currentStream) {
        videoRef.current!.srcObject = currentStream
      }

      setEnabled(true)
      setMediaError(false)
    } catch {
      setEnabled(false)
      setMediaError(true)
    }
  }

  const joinRoom = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = normalizeMeetingCode(roomId)
    if (!displayName.trim() || !code) {
      setRequestError(t('homeLobby.joinRequired'))
      return
    }
    setRequestError(null)
    await enter({ code, displayName })
  }

  // Creating a meeting needs an account: the backend ties the host to a userId.
  const createRoom = async () => {
    if (!user) {
      await navigate('/login?redirectTo=%2F')
      return
    }
    setRequestError(null)
    const name = displayName.trim() || user.displayName
    try {
      const meeting = await create({ displayName: name, title: t('homeLobby.instantTitle', { name }) })
      await enter({ code: meeting.publicCode, displayName: name })
    } catch {
      setRequestError(t('homeLobby.createError'))
    }
  }

  return (
    <section className="home-lobby" aria-labelledby="home-lobby-title">
      <div className="lobby-intro">
        <div className="lobby-intro-copy">
          <p className="eyebrow">{t('homeLobby.heroEyebrow')}</p>
          <h1 id="home-lobby-title">{t('homeLobby.heroTitle')}</h1>
          <p className="lobby-intro-description">{t('homeLobby.heroDescription')}</p>
          <ul className="lobby-benefits" aria-label={t('homeLobby.heroBenefits')}>
            <li><Video size={16} />{t('homeLobby.hdMeetings')}</li>
            <li><MonitorUp size={16} />{t('homeLobby.screenShare')}</li>
            <li><ShieldCheck size={16} />{t('homeLobby.secureCalls')}</li>
          </ul>
          {notice && <p className="lobby-notice" role="status">{t(notice)}</p>}
        </div>
        <div className="lobby-signal" aria-hidden="true">
          <span className="lobby-signal-ring lobby-signal-ring-outer" />
          <span className="lobby-signal-ring lobby-signal-ring-inner" />
          <span className="lobby-signal-dot lobby-signal-dot-one" />
          <span className="lobby-signal-dot lobby-signal-dot-two" />
          <span className="lobby-signal-core"><Video size={28} /></span>
        </div>
      </div>

      <aside className="room-card">
        <div className="room-card-heading">
          <span className="room-card-icon"><Video size={22} /></span>
          <div>
            <p className="eyebrow">{t('homeLobby.roomEyebrow')}</p>
            <h2>{t('homeLobby.roomTitle')}</h2>
            <p>{t('homeLobby.roomDescription')}</p>
          </div>
        </div>

        <form className="room-form" onSubmit={(event) => void joinRoom(event)}>
          <div className="room-field">
            <label htmlFor="display-name">{t('homeLobby.displayName')}</label>
            <div className="room-input-shell">
              <UserRound aria-hidden="true" size={18} />
              <input
                autoComplete="name"
                id="display-name"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={t('homeLobby.displayNamePlaceholder')}
                value={displayName}
              />
            </div>
          </div>

          <div className="room-field">
            <label htmlFor="room-id">{t('homeLobby.roomId')}</label>
            <div className="room-input-shell">
              <Hash aria-hidden="true" size={18} />
              <input
                autoCapitalize="none"
                id="room-id"
                onChange={(event) => setRoomId(event.target.value)}
                placeholder={t('homeLobby.roomIdPlaceholder')}
                value={roomId}
              />
            </div>
          </div>

          <Button className="room-primary-action" disabled={isSubmitting} type="submit">
            {t('homeLobby.joinRoom')}
            <ArrowRight size={20} />
          </Button>
        </form>

        {(requestError || errorKey) && <p className="form-error" role="alert">{requestError ?? t(errorKey ?? '')}</p>}

        <div className="room-divider"><span>{t('homeLobby.noRoom')}</span></div>

        <Button className="room-secondary-action" disabled={isSubmitting} onClick={() => void createRoom()} type="button" variant="outline">
          <Plus size={19} />
          {t('homeLobby.createRoom')}
        </Button>
        <Link className="room-link-action" to="/meetings/schedule">
          <CalendarPlus size={17} />
          {t('homeLobby.scheduleRoom')}
        </Link>

        <div className="available-rooms-heading">
          <div>
            <p className="eyebrow">{t('homeLobby.availableEyebrow')}</p>
            <h3>{t('homeLobby.myMeetings')}</h3>
          </div>
          {user && <Link className="meeting-list-link" to="/meetings">{t('homeLobby.viewAll')}</Link>}
        </div>

        {user ? (
          <MeetingList emptyLabel={t('homeLobby.noMeetings')} meetings={upcoming} />
        ) : (
          <p className="meeting-list-empty">
            <Link to="/login">{t('common.signIn')}</Link> {t('homeLobby.signInHint')}
          </p>
        )}
      </aside>

      <div className="preview-card">
        <div className="preview-heading">
          <div>
            <p className="eyebrow">{t('homeLobby.previewEyebrow')}</p>
            <h2>{t('homeLobby.previewTitle')}</h2>
          </div>
          <span className="preview-status">
            <span aria-hidden="true" />
            {t('homeLobby.ready')}
          </span>
        </div>

        <div className="camera-preview">
          <video
            aria-label={t('homeLobby.cameraPreview')}
            autoPlay
            className={cameraEnabled ? 'is-visible' : ''}
            muted
            playsInline
            ref={videoRef}
          />
          {!cameraEnabled && (
            <div className="camera-placeholder">
              <span className="camera-placeholder-icon"><Video size={30} /></span>
              <strong>{t('homeLobby.cameraOff')}</strong>
              <p>{mediaError ? t('homeLobby.mediaError') : t('homeLobby.cameraHint')}</p>
            </div>
          )}
          <span className="preview-name">{displayName.trim() || t('homeLobby.guestName')}</span>
        </div>

        <div className="device-controls" aria-label={t('homeLobby.deviceControls')}>
          <button
            aria-pressed={microphoneEnabled}
            className="device-button"
            onClick={() => void updateMediaTrack('audio', !microphoneEnabled)}
            type="button"
          >
            {microphoneEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            <span>{microphoneEnabled ? t('homeLobby.micOn') : t('homeLobby.micOff')}</span>
          </button>
          <button
            aria-pressed={cameraEnabled}
            className="device-button"
            onClick={() => void updateMediaTrack('video', !cameraEnabled)}
            type="button"
          >
            {cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
            <span>{cameraEnabled ? t('homeLobby.cameraOn') : t('homeLobby.cameraOff')}</span>
          </button>
          <button className="device-button device-button-settings" onClick={() => navigate('/settings')} type="button">
            <Settings2 size={18} />
            <span>{t('homeLobby.settings')}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HomePage
