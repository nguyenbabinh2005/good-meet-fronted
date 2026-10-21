/** Normalised view of the Spring Boot error body (`ResponseStatusException` / bean validation). */
export type ApiErrorInfo = {
  fieldErrors: Record<string, string>
  message?: string
  status?: number
}
