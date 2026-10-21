import axios from 'axios'
import { env } from '../config/env'

/** The backend has no JWT: identity travels in the body or in `X-Participant-Id`. */
export const PARTICIPANT_HEADER = 'X-Participant-Id'

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

export const participantHeaders = (participantId: string) => ({ [PARTICIPANT_HEADER]: participantId })
