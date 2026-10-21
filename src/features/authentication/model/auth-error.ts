import { getApiError } from '../../../shared/api/api-error'

/** Backend failures (AuthService) -> translation keys. */
export const describeAuthError = (error: unknown) => {
  switch (getApiError(error)?.status) {
    case 401:
      return 'authentication.errors.invalidCredentials'
    case 409:
      return 'authentication.errors.emailAlreadyRegistered'
    case 400:
      return 'authentication.errors.validation'
    default:
      return 'authentication.errors.unavailable'
  }
}
