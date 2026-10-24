import { LayoutGrid, Plus, Undo2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../app/store'
import { getApiError } from '../../../shared/api/api-error'
import {
  useAssignParticipantMutation,
  useCloseBreakoutRoomMutation,
  useCreateBreakoutRoomMutation,
  useReturnParticipantMutation,
} from '../api/breakout.api'
import { roomClosed, roomCreated } from '../model/breakout.slice'
import type { AssignableParticipant, BreakoutRoom } from '../model/types'
import styles from './BreakoutPanel.module.scss'

type BreakoutPanelProps = {
  candidates: AssignableParticipant[]
  code: string
  hostParticipantId: string
  unresolved: string[]
}

const isStaleStatus = (error: unknown) => {
  const status = getApiError(error)?.status
  return status === 404 || status === 409
}

export const BreakoutPanel = ({ candidates, code, hostParticipantId, unresolved }: BreakoutPanelProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const rooms = useAppSelector((state) => state.breakout.rooms)
  const createMutation = useCreateBreakoutRoomMutation()
  const assignMutation = useAssignParticipantMutation()
  const returnMutation = useReturnParticipantMutation()
  const closeMutation = useCloseBreakoutRoomMutation()
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const busy =
    createMutation.isPending || assignMutation.isPending || returnMutation.isPending || closeMutation.isPending

  const run = async (action: () => Promise<void>) => {
    setError(undefined)
    try {
      await action()
    } catch (failure) {
      setError(getApiError(failure)?.message ?? t('breakout.errors.generic'))
    }
  }

  const create = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    void run(async () => {
      const room = await createMutation.mutateAsync({ code, hostParticipantId, name: trimmed })
      dispatch(roomCreated({ id: room.id, name: room.name, participants: [] }))
      setName('')
    })
  }

  const assign = (room: BreakoutRoom, participantId: string) => {
    void run(async () => {
      await assignMutation.mutateAsync({ code, hostParticipantId, participantId, roomId: room.id })
    })
  }

  const sendBack = (roomId: string, participantId: string) => {
    void run(async () => {
      await returnMutation.mutateAsync({ callerParticipantId: hostParticipantId, code, participantId, roomId })
    })
  }

  const close = (room: BreakoutRoom) => {
    if (!window.confirm(t('breakout.confirmClose', { name: room.name }))) return
    void run(async () => {
      try {
        await closeMutation.mutateAsync({ code, hostParticipantId, roomId: room.id })
      } catch (failure) {
        if (!isStaleStatus(failure)) throw failure
      }
      dispatch(roomClosed(room.id))
    })
  }

  return (
    <div className={styles.panel}>
      <form className={styles.createForm} onSubmit={create}>
        <input
          aria-label={t('breakout.roomName')}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('breakout.roomNamePlaceholder')}
          value={name}
        />
        <button disabled={busy || !name.trim()} type="submit">
          <Plus aria-hidden="true" size={16} />
          {t('breakout.create')}
        </button>
      </form>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {unresolved.length > 0 && <p className={styles.notice}>{t('breakout.unresolved', { names: unresolved.join(', ') })}</p>}

      {rooms.length === 0 ? (
        <div className={styles.empty}>
          <LayoutGrid aria-hidden="true" size={28} />
          <strong>{t('breakout.emptyTitle')}</strong>
          <span>{t('breakout.emptyHint')}</span>
        </div>
      ) : (
        <div className={styles.rooms}>
          {rooms.map((room) => {
            const members = room.participants
            return (
              <section aria-label={room.name} className={styles.room} key={room.id}>
                <header>
                  <div>
                    <strong>{room.name}</strong>
                    <span>{t('breakout.members', { count: members.length })}</span>
                  </div>
                  <button
                    aria-label={t('breakout.close', { name: room.name })}
                    disabled={busy}
                    onClick={() => close(room)}
                    type="button"
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                </header>

                {members.length > 0 && (
                  <ul>
                    {members.map((member) => (
                      <li key={member.participantId}>
                        <span>{member.displayName}</span>
                        <button
                          aria-label={t('breakout.sendBack', { name: member.displayName })}
                          disabled={busy}
                          onClick={() => sendBack(room.id, member.participantId)}
                          type="button"
                        >
                          <Undo2 aria-hidden="true" size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <select
                  aria-label={t('breakout.assignTo', { name: room.name })}
                  disabled={busy || candidates.length === 0}
                  onChange={(event) => assign(room, event.target.value)}
                  value=""
                >
                  <option value="">{candidates.length === 0 ? t('breakout.noCandidates') : t('breakout.assignPlaceholder')}</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
