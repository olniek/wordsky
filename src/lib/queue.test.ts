import { describe, expect, it } from 'vitest'
import { RETENTION_DUE_MS, buildStudyQueue } from './queue'
import { getGuidedTopicWords } from '../data/words'
import type { TopicSlug } from '../data/words'
import type { WordStatus } from './progress'

const TOPIC: TopicSlug = 'animals'

function makeAccessors(states: Record<string, { status: WordStatus; updatedAt?: number }>) {
  const getStatus = (_t: TopicSlug, c: string) => states[c]?.status ?? 'unseen'
  const getUpdatedAt = (_t: TopicSlug, c: string) => states[c]?.updatedAt
  return { getStatus, getUpdatedAt }
}

describe('buildStudyQueue', () => {
  it('returns the base guided order when nothing is tracked', () => {
    const { getStatus, getUpdatedAt } = makeAccessors({})
    const queue = buildStudyQueue(TOPIC, getStatus, getUpdatedAt, 0)
    expect(queue.map((w) => w.concept)).toEqual(
      getGuidedTopicWords(TOPIC).map((w) => w.concept),
    )
  })

  it('places learning items before unseen, and due-known before fresh-known', () => {
    const now = 10 * RETENTION_DUE_MS
    const { getStatus, getUpdatedAt } = makeAccessors({
      // dog: learning -> first bucket
      dog: { status: 'learning', updatedAt: now },
      // cat: known, due (very old)
      cat: { status: 'known', updatedAt: 0 },
      // bird: known, fresh (touched now)
      bird: { status: 'known', updatedAt: now },
    })

    const queue = buildStudyQueue(TOPIC, getStatus, getUpdatedAt, now)
    const order = queue.map((w) => w.concept)

    const dogIdx = order.indexOf('dog')
    const catIdx = order.indexOf('cat')
    const birdIdx = order.indexOf('bird')
    // dog (learning) before everything else
    expect(dogIdx).toBe(0)
    // any unseen word appears between learning and due/fresh-known
    const firstUnseen = order.findIndex(
      (c) => c !== 'dog' && c !== 'cat' && c !== 'bird',
    )
    expect(firstUnseen).toBeGreaterThan(dogIdx)
    expect(firstUnseen).toBeLessThan(catIdx)
    // due-known (cat) comes before fresh-known (bird)
    expect(catIdx).toBeLessThan(birdIdx)
  })

  it('treats updatedAt = 0 (migrated known) as immediately due', () => {
    const now = Date.now()
    const { getStatus, getUpdatedAt } = makeAccessors({
      cat: { status: 'known', updatedAt: 0 },
    })
    const queue = buildStudyQueue(TOPIC, getStatus, getUpdatedAt, now)
    const order = queue.map((w) => w.concept)
    // cat (due-known) comes after unseen items but before fresh-known items.
    // With no fresh-known items, cat must at least appear in the list.
    expect(order).toContain('cat')
    // and must come after at least one unseen item (since unseen bucket precedes due bucket)
    const catIdx = order.indexOf('cat')
    expect(catIdx).toBeGreaterThan(0)
  })
})
