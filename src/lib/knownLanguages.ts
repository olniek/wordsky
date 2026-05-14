import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { readJSON, writeJSON } from './storage'

export const KNOWN_LANGS_KEY = 'wordssky.knownLangs.v1'

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (languageOrder as readonly string[]).includes(value)
}

/** Filter to valid `LanguageCode`s in canonical order; preserves "empty means unset". */
export function normalizeKnownLanguages(stored: unknown): LanguageCode[] {
  if (!Array.isArray(stored)) return []
  const raw = stored.filter(isLanguageCode)
  return languageOrder.filter((c) => raw.includes(c))
}

export function loadKnownLanguages(): LanguageCode[] {
  return normalizeKnownLanguages(readJSON<unknown>(KNOWN_LANGS_KEY, []))
}

const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function snapshotKey(): string {
  return JSON.stringify(normalizeKnownLanguages(readJSON<unknown>(KNOWN_LANGS_KEY, [])))
}

const SERVER_SNAPSHOT = JSON.stringify([])

export function useKnownLanguages(): [LanguageCode[], (next: LanguageCode[]) => void] {
  const getServerSnapshot = useCallback(() => SERVER_SNAPSHOT, [])
  const snapshot = useSyncExternalStore(subscribe, snapshotKey, getServerSnapshot)
  const langs = useMemo(() => JSON.parse(snapshot) as LanguageCode[], [snapshot])

  const setKnownLanguages = useCallback((next: LanguageCode[]) => {
    const normalized = normalizeKnownLanguages(next)
    writeJSON(KNOWN_LANGS_KEY, normalized)
    listeners.forEach((fn) => fn())
  }, [])

  return [langs, setKnownLanguages]
}
