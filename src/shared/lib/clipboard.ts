/** Copies text and reports whether it worked (clipboard API needs a secure context). */
export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
