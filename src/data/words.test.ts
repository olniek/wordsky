import { describe, expect, it } from 'vitest'
import { collectTopicWordStudyDataIssues } from './topicWordIntegrity'
import { everydayNouns100 } from './topicEverydayNouns100'
import {
  MAP_GROUP_ORDER,
  cefrHintLevels,
  getGuidedTopicWords,
  topicWords,
  topics,
  type TopicSlug,
  type TopicWord,
} from './words'

describe('topic data integrity', () => {
  it('declares every topic listed in `topics` in `topicWords`', () => {
    for (const topic of topics) {
      expect(topicWords[topic.slug]).toBeDefined()
      expect(topicWords[topic.slug].length).toBeGreaterThan(0)
    }
  })

  it('every word card has translations, example sentences, articles, mapGroup, and speakable text (Study + TTS)', () => {
    const failures: string[] = []
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      const allowed = new Set(MAP_GROUP_ORDER[slug])
      for (const row of rows) {
        failures.push(...collectTopicWordStudyDataIssues(slug, row, allowed))
      }
    }
    expect(failures).toEqual([])
  })

  it('flags an incomplete newly added card (authoring regression guard)', () => {
    const allowed = new Set(MAP_GROUP_ORDER.animals)
    const incomplete = {
      concept: '__fixture-incomplete-row__',
      mapGroup: 'pets',
      forms: { EN: 'cat', DE: '', PT: '', ES: '', FR: '', IT: '' },
      examples: { EN: 'A cat.', DE: '', PT: '', ES: '', FR: '', IT: '' },
      articles: { EN: 'a', DE: '', PT: 'o', ES: 'u', FR: 'u', IT: 'u' },
    } as unknown as TopicWord
    const issues = collectTopicWordStudyDataIssues('animals', incomplete, allowed)
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some((m) => m.includes('forms.DE'))).toBe(true)
    expect(issues.some((m) => m.includes('examples.DE'))).toBe(true)
    expect(issues.some((m) => m.includes('article (DE)'))).toBe(true)
  })

  it('concepts are unique within each topic', () => {
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      const concepts = rows.map((r) => r.concept)
      const unique = new Set(concepts)
      expect(unique.size, `duplicate concepts in ${slug}`).toBe(concepts.length)
    }
  })

  it('cefrHint when set is one of the allowed authoring levels', () => {
    const allowed = new Set(cefrHintLevels)
    const failures: string[] = []
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      for (const row of rows) {
        if (row.cefrHint === undefined) continue
        if (!allowed.has(row.cefrHint)) {
          failures.push(`${slug}/${row.concept} invalid cefrHint "${row.cefrHint}"`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('getGuidedTopicWords keeps difficulty ascending and is a permutation of topicWords', () => {
    for (const topic of topics) {
      const guided = getGuidedTopicWords(topic.slug)
      const source = topicWords[topic.slug]
      expect(guided).toHaveLength(source.length)
      expect(new Set(guided.map((w) => w.concept))).toEqual(new Set(source.map((w) => w.concept)))
      for (let i = 1; i < guided.length; i += 1) {
        const ad = guided[i - 1].difficulty ?? 2
        const bd = guided[i].difficulty ?? 2
        expect(ad).toBeLessThanOrEqual(bd)
      }
    }
  })

  it('getGuidedTopicWords interleaves mapGroup within the same difficulty (animals)', () => {
    const guided = getGuidedTopicWords('animals').map((w) => w.concept)
    // difficulty 1: pets (cat, dog) and birds (bird) → round-robin by MAP_GROUP_ORDER: pets then birds before second pet (rodents are difficulty ≥2)
    expect(guided.slice(0, 3)).toEqual(['cat', 'bird', 'dog'])
  })

  it('getGuidedTopicWords interleaves core vs extended family at default difficulty', () => {
    const guided = getGuidedTopicWords('family').map((w) => w.concept)
    // difficulty 1: core (alphabetical) round-robin with extended (friend only)
    expect(guided.slice(0, 4)).toEqual(['baby', 'friend', 'boy', 'brother'])
    // `child` uses `mirrorEveryday` with explicit difficulty 1 (was previously implicit d=2 in
    // `words.ts`), so it joins the d=1 interleave band and shifts later indices vs older snapshots.
    expect(guided.slice(11, 13)).toEqual(['woman', 'daughter'])
  })

  it('everyday mirrors in family and city match everyday source forms and articles', () => {
    const pairs: [TopicSlug, string][] = [
      ['family', 'man'],
      ['family', 'woman'],
      ['family', 'boy'],
      ['family', 'girl'],
      ['family', 'baby'],
      ['family', 'family'],
      ['family', 'friend'],
      ['family', 'child'],
      ['city', 'country'],
      ['city', 'city'],
      ['city', 'town'],
      ['city', 'place'],
      ['city', 'shop'],
      ['city', 'car'],
      ['city', 'bus'],
      ['city', 'train'],
      ['city', 'bike'],
      ['city', 'plane'],
    ]
    for (const [slug, concept] of pairs) {
      const row = topicWords[slug].find((r) => r.concept === concept)
      const src = everydayNouns100.find((r) => r.concept === concept)
      expect(row, `${slug}/${concept}`).toBeDefined()
      expect(src, `${slug}/${concept}`).toBeDefined()
      expect(row!.forms).toEqual(src!.forms)
      expect(row!.articles).toEqual(src!.articles)
    }
  })

  it('everyday-nouns split topic module has 100 rows', () => {
    expect(topicWords['everyday-nouns']).toHaveLength(100)
  })
})
