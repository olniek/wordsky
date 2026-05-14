export type {
  LangPair,
  MatchedRule,
  RecognitionLevel,
  RecognitionSummary,
  WordRecognition,
} from './types'
export { levelForScore, recognitionLevels } from './types'
export { scoreWord } from './score'
export { summarize, getA1Corpus } from './summarize'
export { applyPatterns, hasPatternsFor } from './patterns'
export { identicalAfterFold, isCognateTagPair, isFalseFriend } from './cognates'
