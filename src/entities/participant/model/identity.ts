export const participantIdFromIdentity = (identity: string) => {
  const separator = identity.indexOf('_')
  if (separator === -1) return undefined
  return identity.slice(separator + 1) || undefined
}
