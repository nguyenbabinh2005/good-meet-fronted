import axios from 'axios'
import { env } from '../config/env'

export const PARTICIPANT_HEADER = 'X-Participant-Id'
export const USER_HEADER = 'X-User-Id'

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

export const participantHeaders = (participantId: string) => ({ [PARTICIPANT_HEADER]: participantId })

export const userHeaders = (userId: string) => ({ [USER_HEADER]: userId })
