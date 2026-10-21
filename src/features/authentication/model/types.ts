/** Client-side identity. The backend only returns `userId` on login; there is no JWT. */
export type AuthUser = {
  displayName: string
  email: string
  userId: string
}

export type LoginInput = { email: string; password: string }
export type RegisterInput = LoginInput & { displayName: string }
