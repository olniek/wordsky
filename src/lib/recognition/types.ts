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

export function levelForScore(score: number): RecognitionLevel {
  if (score >= 90) return 'known'
  if (score >= 75) return 'easy'
  if (score >= 50) return 'learnable'
  return 'new'
}
