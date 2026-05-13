import { beforeEach, describe, expect, it } from 'vitest'
import { TRANSLATION_LANGS_KEY, loadTranslationLanguages, normalizeTranslationLanguages } from './translationLanguages'

describe('normalizeTranslationLanguages', () => {
  it('returns all non-anchor languages when stored is not an array', () => {
    expect(normalizeTranslationLanguages('EN', null)).toEqual(['DE', 'PT', 'ES', 'FR', 'IT'])
    expect(normalizeTranslationLanguages('EN', 'DE')).toEqual(['DE', 'PT', 'ES', 'FR', 'IT'])
    expect(normalizeTranslationLanguages('DE', {})).toEqual(['EN', 'PT', 'ES', 'FR', 'IT'])
  })

  it('returns all non-anchor when stored is empty array', () => {
    expect(normalizeTranslationLanguages('EN', [])).toEqual(['DE', 'PT', 'ES', 'FR', 'IT'])
  })

  it('filters to valid subset in language order', () => {
    expect(normalizeTranslationLanguages('EN', ['ES', 'DE'])).toEqual(['DE', 'ES'])
  })

  it('drops anchor and unknown codes', () => {
    expect(normalizeTranslationLanguages('EN', ['EN', 'DE', 'XX', 'PT'])).toEqual(['DE', 'PT'])
  })

  it('when intersection is empty falls back to all candidates', () => {
    expect(normalizeTranslationLanguages('DE', ['DE'])).toEqual(['EN', 'PT', 'ES', 'FR', 'IT'])
  })

  it('single non-anchor selection is preserved', () => {
    expect(normalizeTranslationLanguages('EN', ['PT'])).toEqual(['PT'])
  })
})

describe('loadTranslationLanguages', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('reads stored array from localStorage', () => {
    window.localStorage.setItem(TRANSLATION_LANGS_KEY, JSON.stringify(['DE']))
    expect(loadTranslationLanguages('EN')).toEqual(['DE'])
  })

  it('treats invalid JSON as default', () => {
    window.localStorage.setItem(TRANSLATION_LANGS_KEY, '{')
    expect(loadTranslationLanguages('EN')).toEqual(['DE', 'PT', 'ES', 'FR', 'IT'])
  })
})
