import { useMemo } from 'react'
import { getGuidedTopicWords, type Topic, type TopicSlug, type TopicWord } from '../data/words'
import { buildStudyQueue } from '../lib/queue'
import type { WordStatus } from '../lib/progress'

type StatusGetter = (slug: TopicSlug, concept: string) => WordStatus
type UpdatedAtGetter = (slug: TopicSlug, concept: string) => number | undefined

/**
 * Snapshot study queue for the topic (retention queue or review-only filter).
 * Recomputes only when topic slug, review focus, or guided word list identity changes —
 * not on every progress tick (see TopicPage).
 */
export function useTopicStudyQueue(
  topic: Topic | null,
  isReviewFocus: boolean,
  getStatus: StatusGetter,
  getUpdatedAt: UpdatedAtGetter,
): {
  allGuidedWords: TopicWord[]
  guidedWords: TopicWord[]
  learningCount: number
} {
  const allGuidedWords = useMemo<TopicWord[]>(
    () => (topic ? getGuidedTopicWords(topic.slug) : []),
    [topic],
  )

  const guidedWords = useMemo<TopicWord[]>(() => {
    if (!topic) return []
    if (isReviewFocus) {
      return allGuidedWords.filter((w) => getStatus(topic.slug, w.concept) === 'learning')
    }
    return buildStudyQueue(topic.slug, getStatus, getUpdatedAt)
    // Snapshot — only recompute when topic or mode changes, not when statuses tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.slug, isReviewFocus, allGuidedWords])

  const learningCount = useMemo(() => {
    if (!topic) return 0
    return allGuidedWords.filter((w) => getStatus(topic.slug, w.concept) === 'learning').length
  }, [allGuidedWords, getStatus, topic])

  return { allGuidedWords, guidedWords, learningCount }
}
