import { getApiError } from '../../../shared/api/api-error'

/** Maps the backend's join failures (JoinService) to translation keys. */
export const describeJoinError = (error: unknown) => {
  const apiError = getApiError(error)
  switch (apiError?.status) {
    case 400:
      return 'joinMeeting.errors.invalid'
    case 403:
      return 'joinMeeting.errors.notStarted'
    case 404:
      return 'joinMeeting.errors.notFound'
    case 410:
      return apiError.message?.toLowerCase().includes('cancel')
        ? 'joinMeeting.errors.cancelled'
        : 'joinMeeting.errors.ended'
    default:
      return 'joinMeeting.errors.generic'
  }
}
