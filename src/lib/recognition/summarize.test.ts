import { beforeEach, describe, expect, it } from 'vitest'
import { _resetRecognitionCache, summarize } from './summarize'

beforeEach(() => {
  _resetRecognitionCache()
})

describe('summarize — over the real A1 corpus', () => {
  it('produces a percentage in [0, 100]', () => {
    const s = summarize('PT', ['EN'])
    expect(s.totalWords).toBeGreaterThan(0)
    expect(s.recognitionPercent).toBeGreaterThanOrEqual(0)
    expect(s.recognitionPercent).toBeLessThanOrEqual(100)
    const sum = s.byLevel.known + s.byLevel.easy + s.byLevel.learnable + s.byLevel.new
    expect(sum).toBe(s.totalWords)
  })

  it('adding a Romance known language to EN never reduces recognition vs EN alone', () => {
    const enOnly = summarize('PT', ['EN'])
    const enEs = summarize('PT', ['EN', 'ES'])
    expect(enEs.recognitionPercent).toBeGreaterThanOrEqual(enOnly.recognitionPercent)
  })

  it('filters out target language from the known set (no trivial 100%)', () => {
    const s = summarize('PT', ['PT', 'EN'])
    expect(s.known).not.toContain('PT')
  })

  it('memoises by (target, sorted-known)', () => {
    const a = summarize('PT', ['EN', 'ES'])
    const b = summarize('PT', ['ES', 'EN'])
    expect(a).toBe(b)
  })

  it('sorts words by score descending', () => {
    const s = summarize('ES', ['PT'])
    for (let i = 1; i < s.words.length; i += 1) {
      expect(s.words[i - 1].score).toBeGreaterThanOrEqual(s.words[i].score)
    }
  })
})
