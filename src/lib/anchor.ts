import { useCallback, useEffect, useState } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { readJSON, writeJSON } from './storage'

export const ANCHOR_KEY = 'wordssky.anchor.v1'
const DEFAULT: LanguageCode = 'EN'

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (languageOrder as readonly string[]).includes(value)
}

export function loadAnchor(): LanguageCode {
  const stored = readJSON<unknown>(ANCHOR_KEY, DEFAULT)
  return isLanguageCode(stored) ? stored : DEFAULT
}

// Cross-tab + cross-component synchronisation without a global store.
const listeners = new Set<(next: LanguageCode) => void>()

export function useAnchorLanguage(): [LanguageCode, (next: LanguageCode) => void] {
  const [anchor, setAnchorState] = useState<LanguageCode>(loadAnchor)

  useEffect(() => {
    const onChange = (next: LanguageCode) => setAnchorState(next)
    listeners.add(onChange)
    return () => {
      listeners.delete(onChange)
    }
  }, [])

  const setAnchor = useCallback((next: LanguageCode) => {
    writeJSON(ANCHOR_KEY, next)
    listeners.forEach((fn) => fn(next))
  }, [])

  return [anchor, setAnchor]
}
