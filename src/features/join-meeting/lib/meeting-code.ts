/**
 * Accepts a bare code ("GM-ABCD-EFGH") or a pasted invite link
 * (".../join?code=gm-abcd-efgh" or ".../meetings/gm-abcd-efgh") and returns the lower-case public code.
 */
export const normalizeMeetingCode = (input: string) => {
  const value = input.trim()
  try {
    const url = new URL(value)
    const fromQuery = url.searchParams.get('code')
    const lastSegment = url.pathname.split('/').filter(Boolean).pop()
    return (fromQuery ?? lastSegment ?? '').trim().toLowerCase()
  } catch {
    return value.toLowerCase()
  }
}
