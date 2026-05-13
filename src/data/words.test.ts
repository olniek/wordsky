import { describe, expect, it } from 'vitest'
import { everydayNouns100 } from './topicEverydayNouns100'
import {
  MAP_GROUP_ORDER,
  getGuidedTopicWords,
  languageOrder,
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

  it('every concept has a non-empty form in every language', () => {
    const failures: string[] = []
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      for (const row of rows) {
        for (const lang of languageOrder) {
          if (!row.forms[lang] || row.forms[lang].trim() === '') {
            failures.push(`${slug}/${row.concept} missing ${lang}`)
          }
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('when examples are set, every language has a non-empty sentence', () => {
    const failures: string[] = []
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      for (const row of rows) {
        if (!row.examples) continue
        for (const lang of languageOrder) {
          if (!row.examples[lang]?.trim()) {
            failures.push(`${slug}/${row.concept} missing example for ${lang}`)
          }
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('every word has a non-empty article in every language', () => {
    const failures: string[] = []
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      for (const row of rows) {
        if (!row.articles) {
          failures.push(`${slug}/${row.concept} missing articles`)
          continue
        }
        for (const lang of languageOrder) {
          if (!row.articles[lang]?.trim()) {
            failures.push(`${slug}/${row.concept} missing article for ${lang}`)
          }
        }
      }
    }
    expect(failures).toEqual([])
  })

  it("every word's mapGroup is declared in MAP_GROUP_ORDER for its topic", () => {
    const failures: string[] = []
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      const allowed = new Set(MAP_GROUP_ORDER[slug])
      for (const row of rows) {
        if (!allowed.has(row.mapGroup)) {
          failures.push(`${slug}/${row.concept} has unknown mapGroup "${row.mapGroup}"`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('concepts are unique within each topic', () => {
    for (const [slug, rows] of Object.entries(topicWords) as [TopicSlug, TopicWord[]][]) {
      const concepts = rows.map((r) => r.concept)
      const unique = new Set(concepts)
      expect(unique.size, `duplicate concepts in ${slug}`).toBe(concepts.length)
    }
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
    // difficulty 2: core vs extended round-robin (unchanged band after new d=1 mirrors)
    expect(guided.slice(11, 13)).toEqual(['child', 'aunt'])
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
