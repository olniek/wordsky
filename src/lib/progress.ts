import { useCallback, useEffect, useMemo, useState } from 'react'
import { languageOrder, topicWords, type LanguageCode, type TopicSlug } from '../data/words'
import { readJSON, writeJSON } from './storage'

export type WordStatus = 'unseen' | 'learning' | 'known'

type StoredWord = 'learning' | 'known'

export type WordRecord = {
  status: StoredWord
  /** When the user last marked this word. ms since epoch. */
  updatedAt: number
}

type StoredProgressV1 = Partial<Record<TopicSlug, Record<string, StoredWord>>>
type StoredProgressV2 = Partial<Record<TopicSlug, Record<string, WordRecord>>>

/** Per concept, per language surface progress. */
export type ConceptLanguageMap = Partial<Record<LanguageCode, WordRecord>>
export type StoredProgressV3 = Partial<Record<TopicSlug, Record<string, ConceptLanguageMap>>>

export const KEY_V1 = 'wordssky.progress.v1'
export const KEY_V2 = 'wordssky.progress.v2'
export const KEY_V3 = 'wordssky.progress.v3'

const TOPIC_SLUGS = new Set(Object.keys(topicWords)) as ReadonlySet<string>
const LANG_SET = new Set(languageOrder) as ReadonlySet<string>

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWordRecord(value: unknown): value is WordRecord {
  if (!isPlainObject(value)) return false
  return (
    (value.status === 'learning' || value.status === 'known') &&
    typeof value.updatedAt === 'number' &&
    Number.isFinite(value.updatedAt)
  )
}

function sanitizeLanguageMap(value: unknown): ConceptLanguageMap {
  if (!isPlainObject(value)) return {}
  const out: ConceptLanguageMap = {}
  for (const [lang, record] of Object.entries(value)) {
    if (!LANG_SET.has(lang)) continue
    if (!isWordRecord(record)) continue
    out[lang as LanguageCode] = record
  }
  return out
}

function sanitizeV3(value: unknown): StoredProgressV3 {
  if (!isPlainObject(value)) return {}
  const out: StoredProgressV3 = {}
  for (const [slug, concepts] of Object.entries(value)) {
    if (!TOPIC_SLUGS.has(slug)) continue
    if (!isPlainObject(concepts)) continue
    const next: Record<string, ConceptLanguageMap> = {}
    for (const [concept, langMap] of Object.entries(concepts)) {
      next[concept] = sanitizeLanguageMap(langMap)
    }
    out[slug as TopicSlug] = next
  }
  return out
}

function sanitizeV2(value: unknown): StoredProgressV2 {
  if (!isPlainObject(value)) return {}
  const out: StoredProgressV2 = {}
  for (const [slug, concepts] of Object.entries(value)) {
    if (!TOPIC_SLUGS.has(slug)) continue
    if (!isPlainObject(concepts)) continue
    const next: Record<string, WordRecord> = {}
    for (const [concept, record] of Object.entries(concepts)) {
      if (isWordRecord(record)) next[concept] = record
    }
    out[slug as TopicSlug] = next
  }
  return out
}

function sanitizeV1(value: unknown): StoredProgressV1 {
  if (!isPlainObject(value)) return {}
  const out: StoredProgressV1 = {}
  for (const [slug, concepts] of Object.entries(value)) {
    if (!TOPIC_SLUGS.has(slug)) continue
    if (!isPlainObject(concepts)) continue
    const next: Record<string, StoredWord> = {}
    for (const [concept, status] of Object.entries(concepts)) {
      if (status === 'learning' || status === 'known') next[concept] = status
    }
    out[slug as TopicSlug] = next
  }
  return out
}

export function migrateV1ToV2(v1: StoredProgressV1): StoredProgressV2 {
  const out: StoredProgressV2 = {}
  for (const [slug, words] of Object.entries(v1) as [TopicSlug, Record<string, StoredWord>][]) {
    if (!words) continue
    const next: Record<string, WordRecord> = {}
    for (const [concept, status] of Object.entries(words)) {
      next[concept] = { status, updatedAt: 0 }
    }
    out[slug] = next
  }
  return out
}

/** Expands each v2 concept record to every language code (same status on each). */
export function migrateV2ToV3(v2: StoredProgressV2): StoredProgressV3 {
  const out: StoredProgressV3 = {}
  for (const [slug, words] of Object.entries(v2) as [TopicSlug, Record<string, WordRecord>][]) {
    if (!words) continue
    const next: Record<string, ConceptLanguageMap> = {}
    for (const [concept, record] of Object.entries(words)) {
      const byLang: ConceptLanguageMap = {}
      for (const lang of languageOrder) {
        byLang[lang] = { ...record }
      }
      next[concept] = byLang
    }
    out[slug] = next
  }
  return out
}

export function loadAll(): StoredProgressV3 {
  const v3Raw = readJSON<unknown>(KEY_V3, null)
  if (v3Raw != null) return sanitizeV3(v3Raw)

  const v2Raw = readJSON<unknown>(KEY_V2, null)
  if (v2Raw != null) {
    const migrated = migrateV2ToV3(sanitizeV2(v2Raw))
    writeJSON(KEY_V3, migrated)
    try {
      window.localStorage.removeItem(KEY_V2)
    } catch {
      // ignore
    }
    return migrated
  }

  const v1Raw = readJSON<unknown>(KEY_V1, null)
  if (v1Raw != null) {
    const migrated = migrateV2ToV3(migrateV1ToV2(sanitizeV1(v1Raw)))
    writeJSON(KEY_V3, migrated)
    try {
      window.localStorage.removeItem(KEY_V1)
    } catch {
      // ignore
    }
    return migrated
  }

  return {}
}

export function getLanguageStatus(
  current: StoredProgressV3,
  topic: TopicSlug,
  concept: string,
  lang: LanguageCode,
): WordStatus {
  const rec = current[topic]?.[concept]?.[lang]
  if (!rec) return 'unseen'
  return rec.status
}

export function getLanguageUpdatedAt(
  current: StoredProgressV3,
  topic: TopicSlug,
  concept: string,
  lang: LanguageCode,
): number | undefined {
  return current[topic]?.[concept]?.[lang]?.updatedAt
}

/**
 * Roll-up for queue / review: `learning` if any language is learning;
 * `known` only if every language in `langs` is known; else `unseen`.
 */
export function conceptStudyAggregateStatus(
  current: StoredProgressV3,
  topic: TopicSlug,
  concept: string,
  langs: LanguageCode[],
): WordStatus {
  if (langs.length === 0) return 'unseen'
  for (const lang of langs) {
    if (getLanguageStatus(current, topic, concept, lang) === 'learning') {
      return 'learning'
    }
  }
  for (const lang of langs) {
    if (getLanguageStatus(current, topic, concept, lang) !== 'known') {
      return 'unseen'
    }
  }
  return 'known'
}

/** When aggregate is `known`, max `updatedAt` among the study languages. */
export function conceptStudyAggregateUpdatedAt(
  current: StoredProgressV3,
  topic: TopicSlug,
  concept: string,
  langs: LanguageCode[],
): number | undefined {
  if (conceptStudyAggregateStatus(current, topic, concept, langs) !== 'known') {
    return undefined
  }
  let maxAt = 0
  for (const lang of langs) {
    const at = getLanguageUpdatedAt(current, topic, concept, lang) ?? 0
    if (at > maxAt) maxAt = at
  }
  return maxAt > 0 ? maxAt : undefined
}

/**
 * Pure reducer over v3 storage. `unseen` removes the language slot; drops the
 * concept key when no languages remain.
 */
export function applyLanguageStatusChange(
  current: StoredProgressV3,
  topic: TopicSlug,
  concept: string,
  lang: LanguageCode,
  status: WordStatus,
  now: number = Date.now(),
): StoredProgressV3 {
  const topicMap = { ...(current[topic] ?? {}) }
  const conceptMap: ConceptLanguageMap = { ...(topicMap[concept] ?? {}) }

  if (status === 'unseen') {
    delete conceptMap[lang]
    if (Object.keys(conceptMap).length === 0) {
      delete topicMap[concept]
    } else {
      topicMap[concept] = conceptMap
    }
  } else {
    conceptMap[lang] = { status, updatedAt: now }
    topicMap[concept] = conceptMap
  }

  if (Object.keys(topicMap).length === 0) {
    const rest = { ...current }
    delete rest[topic]
    return rest
  }

  return { ...current, [topic]: topicMap }
}

const listeners = new Set<(snapshot: StoredProgressV3) => void>()

function broadcast(next: StoredProgressV3) {
  writeJSON(KEY_V3, next)
  listeners.forEach((fn) => fn(next))
}

export function useProgress() {
  const [snapshot, setSnapshot] = useState<StoredProgressV3>(loadAll)

  useEffect(() => {
    const onChange = (next: StoredProgressV3) => setSnapshot(next)
    listeners.add(onChange)
    return () => {
      listeners.delete(onChange)
    }
  }, [])

  const getLanguageStatusCb = useCallback(
    (topic: TopicSlug, concept: string, lang: LanguageCode): WordStatus =>
      getLanguageStatus(snapshot, topic, concept, lang),
    [snapshot],
  )

  const getLanguageUpdatedAtCb = useCallback(
    (topic: TopicSlug, concept: string, lang: LanguageCode): number | undefined =>
      getLanguageUpdatedAt(snapshot, topic, concept, lang),
    [snapshot],
  )

  const setLanguageStatus = useCallback(
    (topic: TopicSlug, concept: string, lang: LanguageCode, status: WordStatus) => {
      const next = applyLanguageStatusChange(loadAll(), topic, concept, lang, status)
      broadcast(next)
    },
    [],
  )

  return {
    snapshot,
    getLanguageStatus: getLanguageStatusCb,
    getLanguageUpdatedAt: getLanguageUpdatedAtCb,
    setLanguageStatus,
  }
}

/** Count known language-cells for a topic limited to `langs`. */
export function countKnownFormsForTopic(
  snapshot: StoredProgressV3,
  topic: TopicSlug,
  langs: LanguageCode[],
): number {
  const rows = topicWords[topic]
  let n = 0
  for (const row of rows) {
    for (const lang of langs) {
      if (getLanguageStatus(snapshot, topic, row.concept, lang) === 'known') {
        n += 1
      }
    }
  }
  return n
}

/** Concepts where aggregate status is `learning` for the given language set. */
export function countConceptsAggregateLearning(
  snapshot: StoredProgressV3,
  topic: TopicSlug,
  langs: LanguageCode[],
): number {
  return topicWords[topic].filter(
    (row) => conceptStudyAggregateStatus(snapshot, topic, row.concept, langs) === 'learning',
  ).length
}

/** True when every (concept, lang) cell in `langs` is `known`. */
export function topicAllFormsKnown(
  snapshot: StoredProgressV3,
  topic: TopicSlug,
  langs: LanguageCode[],
): boolean {
  if (langs.length === 0) return false
  const rows = topicWords[topic]
  if (rows.length === 0) return false
  for (const row of rows) {
    for (const lang of langs) {
      if (getLanguageStatus(snapshot, topic, row.concept, lang) !== 'known') {
        return false
      }
    }
  }
  return true
}

export function useTopicCounts(topic: TopicSlug, langs: LanguageCode[] = languageOrder) {
  const { snapshot } = useProgress()
  return useMemo(() => {
    const total = topicWords[topic].length
    const totalForms = total * langs.length
    const knownForms = countKnownFormsForTopic(snapshot, topic, langs)
    const learningConcepts = countConceptsAggregateLearning(snapshot, topic, langs)
    return {
      total,
      totalForms,
      knownForms,
      learningConcepts,
      started: knownForms > 0 || learningConcepts > 0,
    }
  }, [snapshot, topic, langs])
}
