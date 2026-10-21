import { readStorage, writeStorage } from '../../../shared/lib/storage'
import { emailLocalPart } from '../../../shared/lib/text'
import type { AuthUser } from './types'

const AUTH_KEY = 'good-meet.auth'
const NAMES_KEY = 'good-meet.display-names'

export const readStoredUser = (): AuthUser | undefined => {
  const user = readStorage<Partial<AuthUser> | null>(AUTH_KEY, null)
  return user?.userId && user.email && user.displayName ? (user as AuthUser) : undefined
}

export const writeStoredUser = (user: AuthUser | undefined) => writeStorage(AUTH_KEY, user ?? null)

const readNames = () => readStorage<Record<string, string>>(NAMES_KEY, {})

/** Login returns no profile, so the name chosen at sign-up is remembered per email on this browser. */
export const rememberDisplayName = (email: string, displayName: string) =>
  writeStorage(NAMES_KEY, { ...readNames(), [email]: displayName })

export const resolveDisplayName = (email: string) => readNames()[email] ?? emailLocalPart(email)
