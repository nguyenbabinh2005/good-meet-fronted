export type RecordingStatus = 'COMPLETED' | 'FAILED' | 'RECORDING'

export type Recording = {
  endedAt: string | null
  filePath: string
  fileLocation: string
  id: string
  startedAt: string
  startedByParticipantId: string
  status: RecordingStatus
}
