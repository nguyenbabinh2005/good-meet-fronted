/** `ChatService.MessageView`, both from GET history and from /topic/meetings/{meetingId}/chat. */
export type ChatMessage = {
  content: string
  id: string
  meetingId: string
  senderName: string
  senderParticipantId: string
  sentAt: string
}
