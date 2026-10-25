import { useAppSelector } from '../../../app/store'

export const useAssistantEnabled = (code: string) =>
  useAppSelector(
    (state) =>
      state.assistant.byCode[code] ??
      state.myMeetings.items.find((item) => item.publicCode === code)?.assistantEnabled ??
      false,
  )
