/** localStorage access that never throws (private mode, quota, SSR-less tests). */
export const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage is a convenience only; the app keeps working without it.
  }
}

export const removeStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
