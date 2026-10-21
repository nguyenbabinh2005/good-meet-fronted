import { useEffect, useRef, useState } from 'react'
import { copyText } from '../lib/clipboard'

/** `copied` flips to true for ~2s after a successful copy. */
export const useCopyFeedback = () => {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async (text: string) => {
    const ok = await copyText(text)
    if (!ok) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return { copied, copy }
}
