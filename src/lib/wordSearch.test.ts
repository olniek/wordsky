import { describe, expect, it } from 'vitest'
import { searchVocabulary } from './wordSearch'

describe('searchVocabulary', () => {
  it('returns empty for blank query', () => {
    expect(searchVocabulary('')).toEqual([])
    expect(searchVocabulary('   ')).toEqual([])
  })

  it('finds by English concept substring', () => {
    const hits = searchVocabulary('moth', 10)
    const concepts = hits.map((h) => h.concept)
    expect(concepts).toContain('mother')
  })

  it('finds by non-English form', () => {
    const hits = searchVocabulary('Hund', 20)
    expect(hits.some((h) => h.concept === 'dog')).toBe(true)
  })

  it('finds by text that appears only in an example sentence', () => {
    const hits = searchVocabulary('sonntags', 20)
    const father = hits.find((h) => h.concept === 'father')
    expect(father).toBeDefined()
    expect(father?.matchedLanguages).toContain('DE')
  })

  it('is case-insensitive', () => {
    const a = searchVocabulary('perro', 20)
    const b = searchVocabulary('PERRO', 20)
    expect(a.map((h) => h.concept)).toEqual(b.map((h) => h.concept))
  })

  it('records matched languages', () => {
    const hits = searchVocabulary('Vater', 10)
    const father = hits.find((h) => h.concept === 'father')
    expect(father?.matchedLanguages).toContain('DE')
  })

  it('respects limit', () => {
    const hits = searchVocabulary('e', 3)
    expect(hits.length).toBeLessThanOrEqual(3)
  })

  it('matches German Straße when query uses ss spelling', () => {
    const hits = searchVocabulary('strasse', 20)
    expect(hits.some((h) => h.concept === 'street')).toBe(true)
  })

  it('matches forms when query omits accents', () => {
    const hits = searchVocabulary('pere', 20)
    expect(hits.some((h) => h.concept === 'father')).toBe(true)
  })

  it('matches French hôtel spelling without accent', () => {
    const hits = searchVocabulary('hopital', 20)
    expect(hits.some((h) => h.concept === 'hospital')).toBe(true)
  })

  it('finds by corpus example sentence text', () => {
    const hits = searchVocabulary('home', 30)
    expect(hits.some((h) => h.concept === 'cat')).toBe(true)
  })
})
