import { describe, expect, it } from 'vitest'
import type { LanguageCode, TopicWord } from '../../data/words'
import { scoreWord } from './score'

const dummyExamples: Record<LanguageCode, string> = {
  EN: 'Example.',
  DE: 'Beispiel.',
  PT: 'Exemplo.',
  ES: 'Ejemplo.',
  FR: 'Exemple.',
  IT: 'Esempio.',
}

function word(forms: Record<LanguageCode, string>, concept = 'test', tags?: string[]): TopicWord {
  return {
    concept,
    mapGroup: 'core',
    forms,
    examples: dummyExamples,
    ...(tags?.length ? { tags } : {}),
  }
}

describe('scoreWord — identical after fold', () => {
  it('scores 100 with rule "identical" for diacritic-only differences', () => {
    const w = word({
      EN: 'hotel',
      DE: 'Hotel',
      PT: 'hotel',
      ES: 'hotel',
      FR: 'hôtel',
      IT: 'hotel',
    })
    const r = scoreWord(w, 'FR', ['EN'])
    expect(r.score).toBe(100)
    expect(r.level).toBe('known')
    expect(r.matchedRule).toBe('identical')
    expect(r.matchedVia).toBe('EN')
  })
})

describe('scoreWord — false-friend cap', () => {
  it('caps identical-looking false friends below "learnable"', () => {
    // Gift (DE: poison) ↔ gift (EN: present): identical after fold, but tag forces a cap.
    const w = word(
      {
        EN: 'gift',
        DE: 'Gift',
        PT: 'x',
        ES: 'x',
        FR: 'x',
        IT: 'x',
      },
      'gift-trap',
      ['false-friend-DE-EN'],
    )
    const r = scoreWord(w, 'DE', ['EN'])
    expect(r.score).toBeLessThan(50)
    expect(r.matchedRule).toBe('false-friend-cap')
    expect(r.level).toBe('new')
  })
})

describe('scoreWord — cognate tag', () => {
  it('floors score at 95 for tag-driven cognates', () => {
    const w = word(
      {
        EN: 'university',
        DE: 'Universität',
        PT: 'x',
        ES: 'x',
        FR: 'x',
        IT: 'x',
      },
      'university',
      ['cognate-EN-DE'],
    )
    const r = scoreWord(w, 'DE', ['EN'])
    expect(r.score).toBeGreaterThanOrEqual(95)
    expect(['cognate-tag', 'identical', 'pattern']).toContain(r.matchedRule)
  })
})

describe('scoreWord — pattern bonus EN→PT (-tion / -ção)', () => {
  it('lifts information ↔ informação above plain Levenshtein', () => {
    const w = word({
      EN: 'information',
      DE: 'x',
      PT: 'informação',
      ES: 'x',
      FR: 'x',
      IT: 'x',
    })
    const r = scoreWord(w, 'PT', ['EN'])
    // Plain Levenshtein on "information" vs "informação" ≈ 0.72; with the pattern
    // transform it should clear "learnable" or higher.
    expect(r.score).toBeGreaterThanOrEqual(75)
  })
})

describe('scoreWord — corpus cognate tags (family)', () => {
  it('uses cognate-EN-ES on the shipped family row', async () => {
    const { everydayNouns100 } = await import('../../data/topicEverydayNouns100')
    const row = everydayNouns100.find((r) => r.concept === 'family')
    expect(row?.tags).toContain('cognate-EN-ES')
    const r = scoreWord(row!, 'ES', ['EN'])
    expect(r.score).toBeGreaterThanOrEqual(95)
    expect(r.matchedRule).toBe('cognate-tag')
  })
})

describe('scoreWord — PT↔ES pattern (-ade / -idad)', () => {
  it('recognises cidade / ciudad as similar via pattern', () => {
    const w = word({
      EN: 'x',
      DE: 'x',
      PT: 'cidade',
      ES: 'ciudad',
      FR: 'x',
      IT: 'x',
    })
    const r = scoreWord(w, 'ES', ['PT'])
    expect(r.score).toBeGreaterThanOrEqual(75)
  })
})

describe('scoreWord — short-word skip', () => {
  it('returns "new" for short non-identical lemmas (no fuzzy)', () => {
    const w = word({
      EN: 'I',
      DE: 'ich',
      PT: 'eu',
      ES: 'yo',
      FR: 'je',
      IT: 'io',
    })
    const r = scoreWord(w, 'ES', ['EN'])
    expect(r.score).toBeLessThan(50)
    expect(r.level).toBe('new')
  })
})

describe('scoreWord — multi-known best-match', () => {
  it('picks the best-scoring known language', () => {
    const w = word({
      EN: 'cat',
      DE: 'Katze',
      PT: 'gato',
      ES: 'gato',
      FR: 'chat',
      IT: 'gatto',
    })
    // ES gato and PT gato are identical → 100. Adding ES (closer to PT) should win.
    const rWithSpanish = scoreWord(w, 'PT', ['EN', 'ES'])
    expect(rWithSpanish.score).toBe(100)
    expect(rWithSpanish.matchedVia).toBe('ES')

    const rEnglishOnly = scoreWord(w, 'PT', ['EN'])
    // cat ↔ gato is unrelated for our scorer → "new".
    expect(rEnglishOnly.score).toBeLessThan(50)
  })
})

describe('scoreWord — multi-word target', () => {
  it('averages tokens for multi-word entries', () => {
    const w = word({
      EN: 'good morning',
      DE: 'guten Morgen',
      PT: 'bom dia',
      ES: 'buenos días',
      FR: 'bonjour',
      IT: 'buongiorno',
    })
    const r = scoreWord(w, 'DE', ['EN'])
    // "good" vs "guten" + "morning" vs "Morgen" — both share substantial substrings.
    expect(r.score).toBeGreaterThan(0)
  })
})
