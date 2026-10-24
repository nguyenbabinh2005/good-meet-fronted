import { useEffect, useRef, useState } from 'react'
import { useRealtimeSubscription } from '../../../shared/realtime'
import { MAX_VISIBLE_REACTIONS, REACTION_VISIBLE_MS } from '../model/reactions.ts'
import styles from './ReactionOverlay.module.scss'

type ReactionEvent = {
  displayName: string
  emoji: string
  meetingId: string
  participantId: string
}

type FloatingReaction = {
  emoji: string
  id: number
  name: string
}

type ReactionOverlayProps = {
  meetingId: string
}

export const ReactionOverlay = ({ meetingId }: ReactionOverlayProps) => {
  const [items, setItems] = useState<FloatingReaction[]>([])
  const counter = useRef(0)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useRealtimeSubscription<ReactionEvent>(`/topic/meetings/${meetingId}/reactions`, (event) => {
    counter.current += 1
    const id = counter.current
    setItems((current) => [...current.slice(-(MAX_VISIBLE_REACTIONS - 1)), { emoji: event.emoji, id, name: event.displayName }])
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      setItems((current) => current.filter((item) => item.id !== id))
    }, REACTION_VISIBLE_MS)
    timers.current.add(timer)
  })

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => clearTimeout(timer))
  }, [])

  return (
    <div aria-live="polite" className={styles.overlay}>
      {items.map((item) => (
        <div className={styles.reaction} key={item.id}>
          <span className={styles.emoji}>{item.emoji}</span>
          <span className={styles.name}>{item.name}</span>
        </div>
      ))}
    </div>
  )
}
