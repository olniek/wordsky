import type { LanguageCode } from '../../data/words'
import {
  isFalseFriendPair,
  normalizedSimilarity,
  normalizeLemmaForCompare,
} from '../crossLangLemmaAffinity'
import { applyPatterns } from './patterns'
import type { LangPair } from './types'

const COGNATE_TAG = /^cognate-(EN|DE|PT|ES|FR|IT)-(EN|DE|PT|ES|FR|IT)$/i

/** True iff a `cognate-X-Y` tag (any order) ties langs A and B. */
export function isCognateTagPair(
  tags: string[] | undefined,
  langA: LanguageCode,
  langB: LanguageCode,
): boolean {
  if (!tags?.length || langA === langB) return false
  for (const t of tags) {
    const m = t.match(COGNATE_TAG)
    if (!m) continue
    const a = m[1].toUpperCase()
    const b = m[2].toUpperCase()
    if (a === b) continue
    if ((langA === a && langB === b) || (langA === b && langB === a)) return true
  }
  return false
}

/** True iff a `false-friend-X-Y` tag ties this lang pair. Re-exposes the existing helper. */
export function isFalseFriend(
  tags: string[] | undefined,
  langA: LanguageCode,
  langB: LanguageCode,
): boolean {
  return isFalseFriendPair(tags, langA, langB)
}

/** True iff two lemmas are identical after `latinFoldForSearch`. */
export function identicalAfterFold(a: string, b: string): boolean {
  return normalizeLemmaForCompare(a) === normalizeLemmaForCompare(b)
}

export interface PatternMatch {
  similarity: number
  transformed: string
}

/**
 * Best similarity reachable by applying patterns from `pair` to either lemma.
 * Returns `null` if no transform pushed similarity above 0.9 (cognate threshold).
 */
export function cognateByPattern(
  target: string,
  known: string,
  pair: LangPair,
): PatternMatch | null {
  const COGNATE_SIMILARITY = 0.9
  const targetCandidates = applyPatterns(target, pair)
  const reverse = `${pair.split('-')[1]}-${pair.split('-')[0]}` as LangPair
  const knownCandidates = applyPatterns(known, reverse)
  let best: PatternMatch | null = null
  for (const tCand of targetCandidates) {
    for (const kCand of knownCandidates) {
      const sim = normalizedSimilarity(tCand, kCand)
      if (sim >= COGNATE_SIMILARITY && (!best || sim > best.similarity)) {
        best = { similarity: sim, transformed: tCand }
      }
    }
  }
  return best
}
