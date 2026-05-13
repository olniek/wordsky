import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { readJSON, writeJSON } from './storage'

export const TRANSLATION_LANGS_KEY = 'wordssky.translationLangs.v1'

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (languageOrder as readonly string[]).includes(value)
}

/** Non-anchor languages in canonical display order. */
export function translationCandidates(anchor: LanguageCode): LanguageCode[] {
  return languageOrder.filter((c) => c !== anchor)
}

/**
 * Intersects stored picks with valid non-anchor codes.
 * Empty or invalid stored value means "show all other languages" (default).
 */
export function normalizeTranslationLanguages(anchor: LanguageCode, stored: unknown): LanguageCode[] {
  const candidates = translationCandidates(anchor)
  if (!Array.isArray(stored)) {
    return candidates
  }
  const raw = stored.filter(isLanguageCode)
  const picked = languageOrder.filter((c) => c !== anchor && raw.includes(c))
  return picked.length > 0 ? picked : candidates
}

export function loadTranslationLanguages(anchor: LanguageCode): LanguageCode[] {
  const stored = readJSON<unknown>(TRANSLATION_LANGS_KEY, [])
  return normalizeTranslationLanguages(anchor, stored)
}

const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function snapshotKey(anchor: LanguageCode): string {
  const stored = readJSON<unknown>(TRANSLATION_LANGS_KEY, [])
  return JSON.stringify(normalizeTranslationLanguages(anchor, stored))
}

export function useTranslationLanguages(anchor: LanguageCode): [LanguageCode[], (next: LanguageCode[]) => void] {
  const getSnapshot = useCallback(() => snapshotKey(anchor), [anchor])
  const getServerSnapshot = useCallback(() => JSON.stringify(translationCandidates(anchor)), [anchor])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const langs = useMemo(() => JSON.parse(snapshot) as LanguageCode[], [snapshot])

  const setTranslationLanguages = useCallback(
    (next: LanguageCode[]) => {
      const normalized = normalizeTranslationLanguages(anchor, next)
      writeJSON(TRANSLATION_LANGS_KEY, normalized)
      listeners.forEach((fn) => fn())
    },
    [anchor],
  )

  return [langs, setTranslationLanguages]
}
