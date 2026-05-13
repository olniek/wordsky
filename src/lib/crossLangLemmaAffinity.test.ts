import { describe, expect, it } from 'vitest'
import type { LanguageCode, TopicWord } from '../data/words'
import {
  anchorEchoesTranslationLemma,
  isFalseFriendPair,
  lemmaAffinityByLanguage,
  normalizeLemmaForCompare,
} from './crossLangLemmaAffinity'

function word(forms: Record<LanguageCode, string>, concept = 'test', tags?: string[]): TopicWord {
  return { concept, mapGroup: 'core', forms, ...(tags?.length ? { tags } : {}) }
}

describe('normalizeLemmaForCompare', () => {
  it('case-folds and strips Latin diacritics', () => {
    expect(normalizeLemmaForCompare('hôtel')).toBe('hotel')
    expect(normalizeLemmaForCompare('Hotel')).toBe('hotel')
    expect(normalizeLemmaForCompare('  café  ')).toBe('cafe')
  })

  it('treats ß as ss like latinFoldForSearch', () => {
    expect(normalizeLemmaForCompare('Straße')).toBe('strasse')
  })
})

describe('isFalseFriendPair', () => {
  it('matches tag regardless of order', () => {
    expect(isFalseFriendPair(['false-friend-DE-EN'], 'DE', 'EN')).toBe(true)
    expect(isFalseFriendPair(['false-friend-DE-EN'], 'EN', 'DE')).toBe(true)
    expect(isFalseFriendPair(['false-friend-de-en'], 'EN', 'DE')).toBe(true)
    expect(isFalseFriendPair(['false-friend-DE-EN'], 'DE', 'FR')).toBe(false)
  })
})

describe('lemmaAffinityByLanguage', () => {
  it('marks same when lemmas match after normalization (hotel family)', () => {
    const w = word({
      EN: 'hotel',
      DE: 'Hotel',
      PT: 'hotel',
      ES: 'hotel',
      FR: 'hôtel',
      IT: 'hotel',
    })
    const anchor: LanguageCode = 'DE'
    const langs: LanguageCode[] = ['EN', 'PT', 'ES', 'FR', 'IT']
    const aff = lemmaAffinityByLanguage(w, anchor, langs)
    for (const code of langs) {
      expect(aff[code]).toBe('same')
    }
  })

  it('returns none for unrelated lemmas', () => {
    const w = word({
      EN: 'father',
      DE: 'Vater',
      PT: 'pai',
      ES: 'padre',
      FR: 'père',
      IT: 'genitore',
    })
    const aff = lemmaAffinityByLanguage(w, 'EN', ['DE', 'PT', 'ES', 'FR', 'IT'])
    expect(aff.DE).toBe('none')
    expect(aff.PT).toBe('none')
    expect(aff.ES).toBe('none')
    expect(aff.FR).toBe('none')
    expect(aff.IT).toBe('none')
  })

  it('does not use fuzzy similarity for very short lemmas', () => {
    const w = word({
      EN: 'cat',
      DE: 'Katze',
      PT: 'gato',
      ES: 'gato',
      FR: 'chat',
      IT: 'gatto',
    })
    const aff = lemmaAffinityByLanguage(w, 'EN', ['DE', 'PT', 'ES', 'FR', 'IT'])
    expect(aff.DE).toBe('none')
  })

  it('marks same when only peer is anchor (single translation)', () => {
    const w = word({
      EN: 'hotel',
      DE: 'Hotel',
      PT: 'x',
      ES: 'x',
      FR: 'x',
      IT: 'x',
    })
    const aff = lemmaAffinityByLanguage(w, 'EN', ['DE'])
    expect(aff.DE).toBe('same')
  })

  it('marks same for all langs in a triple that share one normalized lemma', () => {
    const w = word({
      EN: 'bus',
      DE: 'Bus',
      PT: 'ônibus',
      ES: 'bus',
      FR: 'car',
      IT: 'treno',
    })
    const aff = lemmaAffinityByLanguage(w, 'FR', ['EN', 'DE', 'ES'])
    expect(aff.EN).toBe('same')
    expect(aff.DE).toBe('same')
    expect(aff.ES).toBe('same')
  })

  it('marks similar for long lemmas with high edit similarity', () => {
    const w = word({
      EN: 'animal',
      DE: 'Tier',
      PT: 'animal',
      ES: 'animals',
      FR: 'bête',
      IT: 'animale',
    })
    const aff = lemmaAffinityByLanguage(w, 'DE', ['EN', 'ES'])
    expect(aff.EN).toBe('similar')
    expect(aff.ES).toBe('similar')
  })

  it('uses caution instead of same when false-friend tag applies', () => {
    const w = word(
      {
        EN: 'hotel',
        DE: 'Hotel',
        PT: 'x',
        ES: 'x',
        FR: 'x',
        IT: 'x',
      },
      'fake-hotel',
      ['false-friend-DE-EN'],
    )
    const aff = lemmaAffinityByLanguage(w, 'DE', ['EN'])
    expect(aff.EN).toBe('caution')
  })
})

describe('anchorEchoesTranslationLemma', () => {
  it('is true when anchor matches a translation lemma', () => {
    const w = word({
      EN: 'hotel',
      DE: 'Vater',
      PT: 'x',
      ES: 'x',
      FR: 'x',
      IT: 'x',
    })
    expect(anchorEchoesTranslationLemma(w, 'EN', ['DE'])).toBe(false)
    expect(anchorEchoesTranslationLemma(w, 'EN', ['DE', 'PT'])).toBe(false)
    const w2 = word({
      EN: 'hotel',
      DE: 'Hotel',
      PT: 'x',
      ES: 'x',
      FR: 'x',
      IT: 'x',
    })
    expect(anchorEchoesTranslationLemma(w2, 'EN', ['DE'])).toBe(true)
  })

  it('is false when false-friend tag marks the anchor–translation pair', () => {
    const w = word(
      {
        EN: 'hotel',
        DE: 'Hotel',
        PT: 'x',
        ES: 'x',
        FR: 'x',
        IT: 'x',
      },
      'ff',
      ['false-friend-DE-EN'],
    )
    expect(anchorEchoesTranslationLemma(w, 'DE', ['EN'])).toBe(false)
  })
})
