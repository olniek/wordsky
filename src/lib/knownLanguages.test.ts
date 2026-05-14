import { afterEach, describe, expect, it } from 'vitest'
import { KNOWN_LANGS_KEY, loadKnownLanguages, normalizeKnownLanguages } from './knownLanguages'

afterEach(() => {
  window.localStorage.removeItem(KNOWN_LANGS_KEY)
})

describe('normalizeKnownLanguages', () => {
  it('returns empty array for non-arrays', () => {
    expect(normalizeKnownLanguages(null)).toEqual([])
    expect(normalizeKnownLanguages('EN')).toEqual([])
    expect(normalizeKnownLanguages(undefined)).toEqual([])
  })

  it('filters invalid codes and orders by languageOrder', () => {
    expect(normalizeKnownLanguages(['FR', 'EN', 'XX', 'DE'])).toEqual(['EN', 'DE', 'FR'])
  })

  it('returns empty for arrays with no valid codes', () => {
    expect(normalizeKnownLanguages(['XX', 'YY'])).toEqual([])
  })
})

describe('loadKnownLanguages', () => {
  it('reads and normalises from localStorage', () => {
    window.localStorage.setItem(KNOWN_LANGS_KEY, JSON.stringify(['IT', 'ES', 'XX']))
    expect(loadKnownLanguages()).toEqual(['ES', 'IT'])
  })

  it('returns empty for missing key', () => {
    expect(loadKnownLanguages()).toEqual([])
  })
})
