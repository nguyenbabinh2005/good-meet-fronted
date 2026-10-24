import { Smile } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSendReactionMutation } from '../api/presence.api.ts'
import { REACTION_EMOJIS } from '../model/reactions.ts'
import styles from './ReactionPicker.module.scss'

type ReactionPickerProps = {
  code: string
  participantId: string
}

export const ReactionPicker = ({ code, participantId }: ReactionPickerProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const mutation = useSendReactionMutation()

  const send = (emoji: string) => {
    mutation.mutate({ code, emoji, participantId })
    setOpen(false)
  }

  return (
    <div className={styles.wrap}>
      <button aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} type="button">
        <Smile size={20} />
        <span>{t('presence.react')}</span>
      </button>
      {open && (
        <div aria-label={t('presence.reactionPalette')} className={styles.palette} role="menu">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              aria-label={t('presence.sendReaction', { emoji })}
              className={styles.emoji}
              key={emoji}
              onClick={() => send(emoji)}
              role="menuitem"
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
