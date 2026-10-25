export type TranscriptLine = {
  content: string
  id: string
  language: string | null
  participantId: string
  sessionId: string
  speakerName: string
  spokenAt: string
}

export type NotesView = { enabled: boolean }
