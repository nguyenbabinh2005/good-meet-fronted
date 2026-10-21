/** `datetime-local` input value (local time, no zone) -> ISO instant for the API. */
export const localInputToIso = (value: string) => new Date(value).toISOString()

/** ISO instant -> `datetime-local` input value in the browser's time zone. */
export const isoToLocalInput = (iso: string) => {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const formatDateTime = (iso: string | null | undefined, locale: string) =>
  iso
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
    : ''

export const formatTime = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
