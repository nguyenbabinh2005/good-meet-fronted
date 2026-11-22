import { useMeetingQuery } from '../../../entities/meeting/api/meeting.api'

export const useAssistantEnabled = (code: string) => useMeetingQuery(code).data?.assistantEnabled ?? false
