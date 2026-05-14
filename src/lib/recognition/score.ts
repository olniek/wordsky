import type { LanguageCode, TopicWord } from '../../data/words'
import { normalizedSimilarity, normalizeLemmaForCompare } from '../crossLangLemmaAffinity'
import { applyPatterns } from './patterns'
import { cognateByPattern, identicalAfterFold, isCognateTagPair, isFalseFriend } from './cognates'
import type { LangPair, MatchedRule, WordRecognition } from './types'
import { levelForScore } from './types'

/** Minimum fold-normalized length before fuzzy similarity contributes (else require exact). */
export const MIN_FUZZY_LEN = 4

const FALSE_FRIEND_CAP = 49
const COGNATE_TAG_SCORE = 95
const IDENTICAL_SCORE = 100
const PATTERN_BONUS = 10
const PATTERN_BONUS_MIN_SIM = 0.75

interface PairScore {
  score: number
  rule: MatchedRule
  knownForm: string
}

/** Score one target word against one known-language form. */
function scoreAgainstForm(
  target: string,
  known: string,
  targetLang: LanguageCode,
  knownLang: LanguageCode,
  tags: string[] | undefined,
): PairScore {
  if (targetLang === knownLang) {
    return { score: IDENTICAL_SCORE, rule: 'identical', knownForm: known }
  }

  // False friends: cap regardless of similarity (safety net).
  const falseFriend = isFalseFriend(tags, knownLang, targetLang)

  if (identicalAfterFold(target, known)) {
    if (falseFriend) return { score: FALSE_FRIEND_CAP, rule: 'false-friend-cap', knownForm: known }
    return { score: IDENTICAL_SCORE, rule: 'identical', knownForm: known }
  }

  // Tag-driven cognate: floor at 95 unless false-friend overrides.
  if (isCognateTagPair(tags, knownLang, targetLang)) {
    if (falseFriend) return { score: FALSE_FRIEND_CAP, rule: 'false-friend-cap', knownForm: known }
    return { score: COGNATE_TAG_SCORE, rule: 'cognate-tag', knownForm: known }
  }

  const tFold = normalizeLemmaForCompare(target)
  const kFold = normalizeLemmaForCompare(known)
  // Too short for fuzzy AND not identical (handled above) → no useful signal.
  if (tFold.length < MIN_FUZZY_LEN || kFold.length < MIN_FUZZY_LEN) {
    return { score: 0, rule: 'none', knownForm: known }
  }

  const baseSim = normalizedSimilarity(target, known)
  const pair: LangPair = `${knownLang}-${targetLang}`

  // Pattern-driven match: produce candidate transforms and take the best similarity.
  let patternSim = baseSim
  let patternFired = false
  const knownCandidates = applyPatterns(known, pair)
  for (const kCand of knownCandidates) {
    if (kCand === known) continue
    const sim = normalizedSimilarity(kCand, target)
    if (sim > patternSim) {
      patternSim = sim
      patternFired = true
    }
  }
  // Also try transforming target → known direction.
  const reverse: LangPair = `${targetLang}-${knownLang}`
  const targetCandidates = applyPatterns(target, reverse)
  for (const tCand of targetCandidates) {
    if (tCand === target) continue
    const sim = normalizedSimilarity(tCand, known)
    if (sim > patternSim) {
      patternSim = sim
      patternFired = true
    }
  }

  // Strong cognate-by-pattern (≥0.9 after transform) → treat like a tag-driven cognate.
  const patternCognate = cognateByPattern(target, known, pair)
  if (patternCognate) {
    if (falseFriend) return { score: FALSE_FRIEND_CAP, rule: 'false-friend-cap', knownForm: known }
    return {
      score: Math.min(IDENTICAL_SCORE, Math.round(patternCognate.similarity * 100) + PATTERN_BONUS),
      rule: 'pattern',
      knownForm: known,
    }
  }

  let raw = Math.round(patternSim * 100)
  let rule: MatchedRule = patternFired && patternSim > baseSim ? 'pattern' : 'fuzzy'

  if (patternFired && patternSim >= PATTERN_BONUS_MIN_SIM) {
    raw = Math.min(IDENTICAL_SCORE, raw + PATTERN_BONUS)
  }

  if (falseFriend && raw > FALSE_FRIEND_CAP) {
    raw = FALSE_FRIEND_CAP
    rule = 'false-friend-cap'
  }

  if (raw <= 0) rule = 'none'
  return { score: raw, rule, knownForm: known }
}

/**
 * Multi-token average for words like "good morning". Splits on whitespace, scores per
 * token against the corresponding aligned known token (or the best across known tokens
 * when counts differ), and averages.
 */
function scoreTokens(
  target: string,
  known: string,
  targetLang: LanguageCode,
  knownLang: LanguageCode,
  tags: string[] | undefined,
): PairScore {
  const tTokens = target.split(/\s+/).filter(Boolean)
  const kTokens = known.split(/\s+/).filter(Boolean)
  if (tTokens.length <= 1 && kTokens.length <= 1) {
    return scoreAgainstForm(target, known, targetLang, knownLang, tags)
  }
  let total = 0
  let bestRule: MatchedRule = 'none'
  let bestKnown: string | null = null
  let bestPerToken = -1
  for (const tTok of tTokens) {
    let bestForTok: PairScore = { score: 0, rule: 'none', knownForm: kTokens[0] ?? known }
    for (const kTok of kTokens) {
      const s = scoreAgainstForm(tTok, kTok, targetLang, knownLang, tags)
      if (s.score > bestForTok.score) bestForTok = s
    }
    total += bestForTok.score
    if (bestForTok.score > bestPerToken) {
      bestPerToken = bestForTok.score
      bestRule = bestForTok.rule
      bestKnown = bestForTok.knownForm
    }
  }
  return {
    score: Math.round(total / tTokens.length),
    rule: bestRule,
    knownForm: bestKnown ?? known,
  }
}

/** Score one `TopicWord` for a given target language against a set of known languages. */
export function scoreWord(
  word: TopicWord,
  target: LanguageCode,
  known: LanguageCode[],
): WordRecognition {
  const targetForm = word.forms[target]
  if (!targetForm) {
    return {
      concept: word.concept,
      targetForm: '',
      score: 0,
      level: 'new',
      matchedVia: null,
      matchedForm: null,
      matchedRule: 'none',
    }
  }

  let best: { score: number; rule: MatchedRule; knownForm: string; lang: LanguageCode } | null = null
  for (const k of known) {
    if (k === target) {
      // User already knows this language — trivially "known". Caller will usually filter.
      return {
        concept: word.concept,
        targetForm,
        score: IDENTICAL_SCORE,
        level: 'known',
        matchedVia: k,
        matchedForm: word.forms[k],
        matchedRule: 'identical',
      }
    }
    const knownForm = word.forms[k]
    if (!knownForm) continue
    const result = scoreTokens(targetForm, knownForm, target, k, word.tags)
    if (!best || result.score > best.score) {
      best = { score: result.score, rule: result.rule, knownForm: result.knownForm, lang: k }
    }
  }

  if (!best) {
    return {
      concept: word.concept,
      targetForm,
      score: 0,
      level: 'new',
      matchedVia: null,
      matchedForm: null,
      matchedRule: 'none',
    }
  }

  return {
    concept: word.concept,
    targetForm,
    score: best.score,
    level: levelForScore(best.score),
    matchedVia: best.lang,
    matchedForm: best.knownForm,
    matchedRule: best.rule,
  }
}
