import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { languageOrder, type LanguageCode } from '../data/words'
import { mapVisibleLanguageCodes } from './graph'
import { readJSON, writeJSON } from './storage'

export const PROGRESS_LANGS_KEY = 'wordssky.progressLangs.v1'

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (languageOrder as readonly string[]).includes(value)
}

/** Visible languages for Study / Map (anchor + chosen translations, canonical order). */
export function visibleStudyLanguages(
  anchor: LanguageCode,
  translationPicks: LanguageCode[],
): LanguageCode[] {
  return mapVisibleLanguageCodes(anchor, translationPicks)
}

/**
 * Intersects stored codes with current visible set. Empty intersection means
 * "all visible languages count toward progress" (default).
 */
export function normalizeProgressLanguages(
  anchor: LanguageCode,
  translationPicks: LanguageCode[],
  stored: unknown,
): LanguageCode[] {
  const visible = visibleStudyLanguages(anchor, translationPicks)
  const visibleSet = new Set(visible)
  if (!Array.isArray(stored)) {
    return visible
  }
  const raw = stored.filter(isLanguageCode).filter((c) => visibleSet.has(c))
  const ordered = visible.filter((c) => raw.includes(c))
  return ordered.length > 0 ? ordered : visible
}

/** At least one language in `visible` order must remain in the result. */
export function coerceProgressLanguages(
  anchor: LanguageCode,
  translationPicks: LanguageCode[],
  requested: LanguageCode[],
): LanguageCode[] {
  const visible = visibleStudyLanguages(anchor, translationPicks)
  const picked = visible.filter((c) => requested.includes(c))
  if (picked.length > 0) return picked
  return [visible[0]!]
}

export function loadProgressLanguages(anchor: LanguageCode, translationPicks: LanguageCode[]): LanguageCode[] {
  const stored = readJSON<unknown>(PROGRESS_LANGS_KEY, null)
  return normalizeProgressLanguages(anchor, translationPicks, stored)
}

const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function snapshotKey(anchor: LanguageCode, translationPicks: LanguageCode[]): string {
  const progress = loadProgressLanguages(anchor, translationPicks)
  return JSON.stringify(progress)
}

export function useProgressLanguages(
  anchor: LanguageCode,
  translationPicks: LanguageCode[],
): [LanguageCode[], (next: LanguageCode[]) => void] {
  const getSnapshot = useCallback(
    () => snapshotKey(anchor, translationPicks),
    [anchor, translationPicks],
  )
  const getServerSnapshot = useCallback(
    () => JSON.stringify(visibleStudyLanguages(anchor, translationPicks)),
    [anchor, translationPicks],
  )

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const langs = useMemo(() => JSON.parse(snapshot) as LanguageCode[], [snapshot])

  const setProgressLanguages = useCallback(
    (next: LanguageCode[]) => {
      const normalized = coerceProgressLanguages(anchor, translationPicks, next)
      writeJSON(PROGRESS_LANGS_KEY, normalized)
      listeners.forEach((fn) => fn())
    },
    [anchor, translationPicks],
  )

  return [langs, setProgressLanguages]
}
