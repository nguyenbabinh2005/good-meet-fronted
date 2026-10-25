export type MinutesStatus = 'COMPLETED' | 'FAILED' | 'GENERATING'

export type MinutesActionItem = {
  assignee: string | null
  deadline: string | null
  task: string
}

export type Minutes = {
  actionItems: MinutesActionItem[]
  createdAt: string
  decisions: string[]
  discussionPoints: string[]
  errorMessage: string | null
  id: string
  meetingId: string
  sessionId: string
  status: MinutesStatus
  summaryText: string | null
  version: number
}
