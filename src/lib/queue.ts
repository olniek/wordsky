import { getGuidedTopicWords, type TopicSlug, type TopicWord } from '../data/words'
import type { WordStatus } from './progress'

/** A `known` word becomes "due for review" once this much time has passed. */
export const RETENTION_DUE_MS = 3 * 24 * 60 * 60 * 1000

type StatusGetter = (topic: TopicSlug, concept: string) => WordStatus
type UpdatedAtGetter = (topic: TopicSlug, concept: string) => number | undefined

/**
 * Build the per-session study queue using a simple retention rule:
 *   1. words the user is still learning
 *   2. words they haven't seen yet
 *   3. `known` words that haven't been touched in ≥ RETENTION_DUE_MS  (due for review)
 *   4. recently-known words (skipped in practice; kept for completeness)
 *
 * Within each bucket the guided order from `getGuidedTopicWords` is preserved
 * (difficulty ascending, then round-robin by `mapGroup` inside each band).
 * This is light spacing only (see UX.md §8: no heavy SRS, streaks, or social).
 * Intended to be snapshotted at session start so the active index stays stable
 * while the user marks per-language "Got it" / "Still learning" then Continue.
 *
 * `getStatus` / `getUpdatedAt` are **concept-level aggregates** over the learner’s
 * current study language set (anchor + chosen translations), not per-language cells.
 */
export function buildStudyQueue(
  topic: TopicSlug,
  getStatus: StatusGetter,
  getUpdatedAt: UpdatedAtGetter,
  now: number = Date.now(),
): TopicWord[] {
  const base = getGuidedTopicWords(topic)
  const learning: TopicWord[] = []
  const unseen: TopicWord[] = []
  const due: TopicWord[] = []
  const fresh: TopicWord[] = []

  for (const word of base) {
    const status = getStatus(topic, word.concept)
    if (status === 'learning') {
      learning.push(word)
    } else if (status === 'unseen') {
      unseen.push(word)
    } else {
      const at = getUpdatedAt(topic, word.concept) ?? 0
      if (now - at >= RETENTION_DUE_MS) due.push(word)
      else fresh.push(word)
    }
  }

  return [...learning, ...unseen, ...due, ...fresh]
}
