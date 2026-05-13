import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ANCHOR_KEY, loadAnchor } from './anchor'

describe('anchor persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it("defaults to 'EN' when nothing is stored", () => {
    expect(loadAnchor()).toBe('EN')
  })

  it('returns a valid stored anchor', () => {
    window.localStorage.setItem(ANCHOR_KEY, JSON.stringify('DE'))
    expect(loadAnchor()).toBe('DE')
  })

  it('accepts Italian as anchor', () => {
    window.localStorage.setItem(ANCHOR_KEY, JSON.stringify('IT'))
    expect(loadAnchor()).toBe('IT')
  })

  it("falls back to 'EN' on garbage values", () => {
    window.localStorage.setItem(ANCHOR_KEY, JSON.stringify('not-a-code'))
    expect(loadAnchor()).toBe('EN')
  })

  it("falls back to 'EN' on unparseable JSON", () => {
    window.localStorage.setItem(ANCHOR_KEY, '{not-json')
    expect(loadAnchor()).toBe('EN')
  })
})
