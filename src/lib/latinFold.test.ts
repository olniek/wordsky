import { describe, expect, it } from 'vitest'
import { latinFoldForSearch } from './latinFold'

describe('latinFoldForSearch', () => {
  it('case-folds and strips Latin diacritics', () => {
    expect(latinFoldForSearch('hôtel')).toBe('hotel')
    expect(latinFoldForSearch('  café  ')).toBe('cafe')
  })

  it('maps German sharp s to ss for matching', () => {
    expect(latinFoldForSearch('Straße')).toBe('strasse')
    expect(latinFoldForSearch('GROSS')).toBe('gross')
  })
})
