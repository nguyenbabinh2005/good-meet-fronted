export type RaisedHand = {
  displayName: string
  participantId: string
}

export type HandsSnapshot = {
  meetingId: string
  raisedParticipants: RaisedHand[]
}

export type HandsChangedEvent = HandsSnapshot & {
  participantId: string
  raised: boolean
}
