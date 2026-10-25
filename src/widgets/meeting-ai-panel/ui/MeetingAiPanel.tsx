import { AssistantToggle } from '../../../features/assistant'
import { NotesToggle, TranscriptList } from '../../../features/transcript'
import styles from './MeetingAiPanel.module.scss'

type MeetingAiPanelProps = { code: string; isHost: boolean; participantId: string }

export const MeetingAiPanel = ({ code, isHost, participantId }: MeetingAiPanelProps) => (
  <div className={styles.panel}>
    {isHost && (
      <section className={styles.settings}>
        <NotesToggle code={code} hostParticipantId={participantId} />
        <AssistantToggle code={code} hostParticipantId={participantId} />
      </section>
    )}
    <div className={styles.content}>
      <TranscriptList code={code} participantId={participantId} />
    </div>
  </div>
)
