import type { LanguageCode, TopicWord } from '../data/words'
import { latinFoldForSearch } from './latinFold'

export type LemmaAffinity = 'none' | 'similar' | 'same' | 'caution'

/** Minimum normalized lemma length for fuzzy (Levenshtein) similarity. */
const MIN_LEN_FOR_FUZZY = 4

/** 1 − editDistance / max(len); pairwise threshold for `similar`. */
const SIMILARITY_THRESHOLD = 0.85

const LANGUAGE_CODES: readonly LanguageCode[] = ['EN', 'DE', 'PT', 'ES', 'FR', 'IT']

function isLanguageCode(s: string): s is LanguageCode {
  return (LANGUAGE_CODES as readonly string[]).includes(s)
}

/** `false-friend-DE-EN` — anchor/translation pair must not get helpful same/similar styling. */
const FALSE_FRIEND_TAG = /^false-friend-(EN|DE|PT|ES|FR|IT)-(EN|DE|PT|ES|FR|IT)$/i

export function isFalseFriendPair(
  tags: string[] | undefined,
  langA: LanguageCode,
  langB: LanguageCode,
): boolean {
  if (!tags?.length || langA === langB) return false
  for (const t of tags) {
    const m = t.match(FALSE_FRIEND_TAG)
    if (!m) continue
    const a = m[1].toUpperCase()
    const b = m[2].toUpperCase()
    if (!isLanguageCode(a) || !isLanguageCode(b)) continue
    if (a === b) continue
    if ((langA === a && langB === b) || (langA === b && langB === a)) return true
  }
  return false
}

/** Trim, NFC, strip Latin combining marks, lower-case, ß→ss (dataset is Latin A1). */
export function normalizeLemmaForCompare(lemma: string): string {
  return latinFoldForSearch(lemma)
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j += 1) row[j] = j
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost)
      prev = tmp
    }
  }
  return row[b.length]
}

function similarityRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

/** Normalized 0–1 similarity of two raw strings after `latinFoldForSearch`. */
export function normalizedSimilarity(a: string, b: string): number {
  return similarityRatio(normalizeLemmaForCompare(a), normalizeLemmaForCompare(b))
}

function isSameLemma(word: TopicWord, a: LanguageCode, b: LanguageCode): boolean {
  return normalizeLemmaForCompare(word.forms[a]) === normalizeLemmaForCompare(word.forms[b])
}

function isSimilarPair(word: TopicWord, a: LanguageCode, b: LanguageCode): boolean {
  if (a === b) return false
  const na = normalizeLemmaForCompare(word.forms[a])
  const nb = normalizeLemmaForCompare(word.forms[b])
  if (na.length < MIN_LEN_FOR_FUZZY || nb.length < MIN_LEN_FOR_FUZZY) return false
  if (na === nb) return false
  return similarityRatio(na, nb) >= SIMILARITY_THRESHOLD
}

/**
 * For each translation language in `translationLanguages`, how strongly its lemma
 * matches another visible translation or the anchor (after normalization).
 */
export function lemmaAffinityByLanguage(
  word: TopicWord,
  anchor: LanguageCode,
  translationLanguages: LanguageCode[],
): Partial<Record<LanguageCode, LemmaAffinity>> {
  const out: Partial<Record<LanguageCode, LemmaAffinity>> = {}
  const others = (code: LanguageCode) =>
    translationLanguages.filter((c) => c !== code) as LanguageCode[]

  for (const code of translationLanguages) {
    if (isFalseFriendPair(word.tags, anchor, code)) {
      out[code] = 'caution'
      continue
    }
    if (isSameLemma(word, code, anchor)) {
      out[code] = 'same'
      continue
    }
    const hasSameTranslationPeer = others(code).some((o) => isSameLemma(word, code, o))
    if (hasSameTranslationPeer) {
      out[code] = 'same'
      continue
    }

    const similarToAnchor = isSimilarPair(word, code, anchor)
    const similarToPeer = others(code).some((o) => isSimilarPair(word, code, o))
    if (similarToAnchor || similarToPeer) {
      out[code] = 'similar'
    } else {
      out[code] = 'none'
    }
  }

  return out
}

/** True if the anchor lemma matches or is fuzzy-similar to any listed translation lemma. */
export function anchorEchoesTranslationLemma(
  word: TopicWord,
  anchor: LanguageCode,
  translationLanguages: LanguageCode[],
): boolean {
  for (const code of translationLanguages) {
    if (isFalseFriendPair(word.tags, anchor, code)) continue
    if (isSameLemma(word, anchor, code)) return true
    if (isSimilarPair(word, anchor, code)) return true
  }
  return false
}
