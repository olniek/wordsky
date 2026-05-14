import { describe, expect, it } from 'vitest'
import { levelForScore } from './types'

describe('levelForScore', () => {
  it('uses default thresholds when pair is omitted', () => {
    expect(levelForScore(90)).toBe('known')
    expect(levelForScore(75)).toBe('easy')
    expect(levelForScore(50)).toBe('learnable')
    expect(levelForScore(48)).toBe('new')
  })

  it('uses EN-PT stricter learnable floor when pair is EN-PT', () => {
    expect(levelForScore(48, 'EN-PT')).toBe('learnable')
    expect(levelForScore(44, 'EN-PT')).toBe('new')
    expect(levelForScore(84, 'EN-PT')).toBe('easy')
    expect(levelForScore(68, 'EN-PT')).toBe('learnable')
  })

  it('mirrors EN-PT thresholds for PT-EN', () => {
    expect(levelForScore(48, 'PT-EN')).toBe('learnable')
  })
})
