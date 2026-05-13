import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  PROGRESS_LANGS_KEY,
  coerceProgressLanguages,
  normalizeProgressLanguages,
} from './progressLanguages'

describe('progressLanguages', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('normalizeProgressLanguages: null stored uses full visible set', () => {
    expect(normalizeProgressLanguages('EN', ['DE', 'PT'], null)).toEqual(['EN', 'DE', 'PT'])
  })

  it('normalizeProgressLanguages: keeps order and visible-only subset', () => {
    expect(normalizeProgressLanguages('EN', ['DE', 'PT'], ['PT', 'EN'])).toEqual(['EN', 'PT'])
  })

  it('normalizeProgressLanguages: empty intersection falls back to all visible', () => {
    expect(normalizeProgressLanguages('EN', ['DE'], ['PT', 'IT'])).toEqual(['EN', 'DE'])
  })

  it('coerceProgressLanguages: preserves requested order within visible', () => {
    expect(coerceProgressLanguages('EN', ['DE', 'PT'], ['PT', 'EN'])).toEqual(['EN', 'PT'])
  })

  it('coerceProgressLanguages: empty request keeps first visible language', () => {
    expect(coerceProgressLanguages('EN', ['DE', 'PT'], [])).toEqual(['EN'])
  })

  it('coerceProgressLanguages: filters codes outside visible', () => {
    expect(coerceProgressLanguages('EN', ['DE'], ['EN', 'DE', 'PT'])).toEqual(['EN', 'DE'])
  })

  it('PROGRESS_LANGS_KEY is stable', () => {
    expect(PROGRESS_LANGS_KEY).toBe('wordssky.progressLangs.v1')
  })
})
