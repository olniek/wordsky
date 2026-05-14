import type { LanguageCode, TopicWord } from '../../data/words'
import { topicWords } from '../../data/words'
import { scoreWord } from './score'
import type { RecognitionLevel, RecognitionSummary, WordRecognition } from './types'

let cachedCorpus: TopicWord[] | null = null

/**
 * Flatten all topic word lists into a single deduplicated A1 corpus, keyed by `concept`.
 * Dedup is needed because `everyday-nouns` overlaps with the per-topic lists.
 */
export function getA1Corpus(): TopicWord[] {
  if (cachedCorpus) return cachedCorpus
  const seen = new Set<string>()
  const out: TopicWord[] = []
  for (const slug of Object.keys(topicWords) as (keyof typeof topicWords)[]) {
    for (const row of topicWords[slug]) {
      if (seen.has(row.concept)) continue
      seen.add(row.concept)
      out.push(row)
    }
  }
  cachedCorpus = out
  return out
}

const memo = new Map<string, RecognitionSummary>()

function memoKey(target: LanguageCode, known: LanguageCode[]): string {
  return `${target}::${[...known].sort().join(',')}`
}

/**
 * Aggregate per-word recognition scores into a summary for one (target, known[]) pair.
 * Memoised per session — corpus is static at runtime.
 */
export function summarize(target: LanguageCode, known: LanguageCode[]): RecognitionSummary {
  const cleanKnown = known.filter((k) => k !== target)
  const cacheKey = memoKey(target, cleanKnown)
  const hit = memo.get(cacheKey)
  if (hit) return hit

  const corpus = getA1Corpus()
  const words: WordRecognition[] = []
  const byLevel: Record<RecognitionLevel, number> = { known: 0, easy: 0, learnable: 0, new: 0 }

  for (const row of corpus) {
    if (!row.forms[target]) continue
    const rec = scoreWord(row, target, cleanKnown)
    words.push(rec)
    byLevel[rec.level] += 1
  }

  words.sort((a, b) => b.score - a.score)
  const totalWords = words.length
  const recognised = byLevel.known + byLevel.easy + byLevel.learnable
  const recognitionPercent = totalWords > 0 ? Math.round((recognised / totalWords) * 100) : 0

  const summary: RecognitionSummary = {
    target,
    known: cleanKnown,
    totalWords,
    byLevel,
    recognitionPercent,
    words,
  }
  memo.set(cacheKey, summary)
  return summary
}

/** Test helper — corpus is module-cached; tests that swap data must clear it. */
export function _resetRecognitionCache(): void {
  cachedCorpus = null
  memo.clear()
}
