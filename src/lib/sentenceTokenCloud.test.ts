import { describe, expect, it } from 'vitest'
import { buildSentenceTokenCloud } from './sentenceTokenCloud'

describe('buildSentenceTokenCloud', () => {
  it('aggregates tokens and excludes stopwords', () => {
    const sentences = [
      'The cat sat on the mat.',
      'The cat sat near the door.',
    ]
    const cloud = buildSentenceTokenCloud(sentences, 'EN', { excludeLemmaForms: ['cat'] })
    const tokens = cloud.map((e) => e.token)
    expect(tokens).not.toContain('the')
    expect(tokens).not.toContain('cat')
    expect(tokens).toContain('sat')
    expect(tokens).toContain('mat')
    expect(tokens).toContain('door')
    const sat = cloud.find((e) => e.token === 'sat')
    expect(sat?.count).toBe(2)
    expect(sat?.weight).toBe(1)
  })

  it('respects excludeLemmaForms folding', () => {
    const cloud = buildSentenceTokenCloud(['Café cat café'], 'EN', { excludeLemmaForms: ['Café'] })
    expect(cloud.map((e) => e.token)).not.toContain('cafe')
  })

  it('caps at 24 entries sorted by count descending', () => {
    const toWord = (i: number) => {
      let s = ''
      let n = i + 1
      while (n > 0) {
        n -= 1
        s = String.fromCharCode(97 + (n % 26)) + s
        n = Math.floor(n / 26)
      }
      return `w${s}`
    }
    const sentences = Array.from({ length: 40 }, (_, i) => `${toWord(i)}.`)
    const cloud = buildSentenceTokenCloud(sentences, 'EN')
    expect(cloud.length).toBe(24)
    for (let i = 1; i < cloud.length; i++) {
      expect(cloud[i - 1]!.count).toBeGreaterThanOrEqual(cloud[i]!.count)
    }
  })
})
