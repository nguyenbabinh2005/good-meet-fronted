const required = (name: string, value: string | undefined) => {
  if (!value?.trim()) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value.trim()
}

const removeTrailingSlashes = (value: string) => {
  let end = value.length
  while (end > 0 && (value.codePointAt(end - 1) ?? 0) === 47) end -= 1

  return value.slice(0, end)
}

const requiredUrl = (name: string, value: string | undefined, protocols: string[]) => {
  const rawValue = required(name, value)
  let parsed: URL

  try {
    parsed = new URL(rawValue)
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`)
  }

  if (!protocols.includes(parsed.protocol)) {
    throw new Error(`${name} must use one of these protocols: ${protocols.join(', ')}`)
  }

  return removeTrailingSlashes(rawValue)
}

export const env = {
  appName: import.meta.env.VITE_WEBSITE_NAME ?? 'Good Meet',
  apiBaseUrl: requiredUrl('VITE_API_HOST_URL', import.meta.env.VITE_API_HOST_URL, ['http:', 'https:']),
  socketUrl: requiredUrl('VITE_SOCKET_URL', import.meta.env.VITE_SOCKET_URL, ['ws:', 'wss:']),
}
