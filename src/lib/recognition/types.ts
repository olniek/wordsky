import type { LanguageCode } from '../../data/words'

export type RecognitionLevel = 'known' | 'easy' | 'learnable' | 'new'

export const recognitionLevels: readonly RecognitionLevel[] = ['known', 'easy', 'learnable', 'new']

export type LangPair = `${LanguageCode}-${LanguageCode}`

export type MatchedRule =
  | 'identical'
  | 'cognate-tag'
  | 'pattern'
  | 'fuzzy'
  | 'false-friend-cap'
  | 'none'

export interface WordRecognition {
  concept: string
  targetForm: string
  score: number
  level: RecognitionLevel
  matchedVia: LanguageCode | null
  matchedForm: string | null
  matchedRule: MatchedRule
}

export interface RecognitionSummary {
  target: LanguageCode
  known: LanguageCode[]
  totalWords: number
  byLevel: Record<RecognitionLevel, number>
  recognitionPercent: number
  words: WordRecognition[]
}

/** Score thresholds for a single known→target pair (subset fields override defaults). */
export type LevelThresholds = { known: number; easy: number; learnable: number }

/** Default recognition buckets (score 0–100). */
export const LEVEL_THRESHOLDS: LevelThresholds = { known: 90, easy: 75, learnable: 50 }

/**
 * Optional stricter buckets per known→target pair (e.g. EN→PT) to reduce
 * over-optimism where fuzzy matches are common.
 */
export const PAIR_THRESHOLDS: Partial<Record<LangPair, Partial<LevelThresholds>>> = {
  'EN-PT': { known: 85, easy: 70, learnable: 45 },
  'PT-EN': { known: 85, easy: 70, learnable: 45 },
}

export function levelForScore(score: number, pair?: LangPair): RecognitionLevel {
  const o = pair ? PAIR_THRESHOLDS[pair] : undefined
  const knownTh = o?.known ?? LEVEL_THRESHOLDS.known
  const easyTh = o?.easy ?? LEVEL_THRESHOLDS.easy
  const learnTh = o?.learnable ?? LEVEL_THRESHOLDS.learnable
  if (score >= knownTh) return 'known'
  if (score >= easyTh) return 'easy'
  if (score >= learnTh) return 'learnable'
  return 'new'
}
