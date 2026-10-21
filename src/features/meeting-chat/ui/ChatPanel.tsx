import { MessageSquare, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { formatTime } from '../../../shared/lib/date-time'
import type { ChatMessage } from '../model/types'
import styles from './ChatPanel.module.scss'

type ChatPanelProps = {
  connected: boolean
  currentParticipantId: string
  historyFailed: boolean
  loading: boolean
  messages: ChatMessage[]
  onSend: (content: string) => boolean
  sendFailed: boolean
}

export const ChatPanel = ({
  connected,
  currentParticipantId,
  historyFailed,
  loading,
  messages,
  onSend,
  sendFailed,
}: ChatPanelProps) => {
  const { i18n, t } = useTranslation()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages.length])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (onSend(draft)) setDraft('')
  }

  return (
    <div className={styles.chatPanel}>
      <div aria-live="polite" className={styles.messages} role="log">
        {messages.length === 0 && !loading && (
          <div className={styles.emptyChat}>
            <MessageSquare size={28} />
            <strong>{t('meetingRoom.chatEmpty')}</strong>
            <span>{t('meetingRoom.chatHint')}</span>
          </div>
        )}
        {messages.map((message) => {
          const own = message.senderParticipantId === currentParticipantId
          return (
            <article className={own ? `${styles.message} ${styles.own}` : styles.message} key={message.id}>
              <header>
                <strong>{own ? t('meetingRoom.you') : message.senderName}</strong>
                <time dateTime={message.sentAt}>{formatTime(message.sentAt, i18n.language)}</time>
              </header>
              <p>{message.content}</p>
            </article>
          )
        })}
        <div ref={endRef} />
      </div>

      {historyFailed && <p className={styles.notice}>{t('meetingRoom.chatHistoryFailed')}</p>}
      {sendFailed && (
        <p className={styles.notice} role="alert">
          {t('meetingRoom.chatSendFailed')}
        </p>
      )}
      {!connected && <p className={styles.notice}>{t('meetingRoom.chatOffline')}</p>}

      <form className={styles.chatComposer} onSubmit={submit}>
        <input
          aria-label={t('meetingRoom.messagePlaceholder')}
          maxLength={2000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('meetingRoom.messagePlaceholder')}
          value={draft}
        />
        <button aria-label={t('meetingRoom.sendMessage')} disabled={!draft.trim() || !connected} type="submit">
          <SendHorizontal size={20} />
        </button>
      </form>
    </div>
  )
}
