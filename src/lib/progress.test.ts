import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  KEY_V1,
  KEY_V3,
  applyLanguageStatusChange,
  conceptStudyAggregateStatus,
  conceptStudyAggregateUpdatedAt,
  getLanguageStatus,
  loadAll,
  migrateV1ToV2,
  migrateV2ToV3,
} from './progress'

const TOPIC = 'animals' as const

describe('progress storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('sanitizes garbage in stored v3 (drops unknown slugs, langs, malformed records)', () => {
    window.localStorage.setItem(
      KEY_V3,
      JSON.stringify({
        animals: {
          dog: {
            EN: { status: 'known', updatedAt: 5 },
            XX: { status: 'known', updatedAt: 5 }, // bogus lang
            DE: { status: 'maybe', updatedAt: 5 }, // bogus status
            FR: { status: 'known', updatedAt: 'nope' }, // bogus updatedAt
          },
        },
        notATopic: { dog: { EN: { status: 'known', updatedAt: 1 } } }, // bogus slug
        family: 'garbage', // bogus shape
      }),
    )

    const loaded = loadAll()

    expect(loaded.animals?.dog?.EN).toEqual({ status: 'known', updatedAt: 5 })
    expect(loaded.animals?.dog).not.toHaveProperty('XX')
    expect(loaded.animals?.dog).not.toHaveProperty('DE')
    expect(loaded.animals?.dog).not.toHaveProperty('FR')
    expect(loaded).not.toHaveProperty('notATopic')
    expect(loaded.family).toBeUndefined()
  })

  it('returns empty progress when v3 storage is not an object', () => {
    window.localStorage.setItem(KEY_V3, JSON.stringify('totally garbage'))
    expect(loadAll()).toEqual({})
  })

  it('migrates v1 entries to v3 per-language records and clears v1', () => {
    window.localStorage.setItem(
      KEY_V1,
      JSON.stringify({ animals: { dog: 'known', cat: 'learning' } }),
    )

    const loaded = loadAll()

    expect(loaded.animals?.dog?.EN).toEqual({ status: 'known', updatedAt: 0 })
    expect(loaded.animals?.dog?.PT).toEqual({ status: 'known', updatedAt: 0 })
    expect(loaded.animals?.cat?.EN).toEqual({ status: 'learning', updatedAt: 0 })
    expect(window.localStorage.getItem(KEY_V3)).not.toBeNull()
    expect(window.localStorage.getItem(KEY_V1)).toBeNull()
  })

  it('migrateV1ToV2 is a pure transform with updatedAt: 0', () => {
    const out = migrateV1ToV2({ animals: { dog: 'known' } })
    expect(out).toEqual({ animals: { dog: { status: 'known', updatedAt: 0 } } })
  })

  it('migrateV2ToV3 copies each concept to every language', () => {
    const v3 = migrateV2ToV3({
      animals: { dog: { status: 'known', updatedAt: 42 } },
    })
    expect(v3.animals?.dog?.EN).toEqual({ status: 'known', updatedAt: 42 })
    expect(v3.animals?.dog?.IT).toEqual({ status: 'known', updatedAt: 42 })
  })

  it('applyLanguageStatusChange writes a record with updatedAt = now', () => {
    const next = applyLanguageStatusChange({}, TOPIC, 'dog', 'EN', 'known', 12345)
    expect(next.animals?.dog?.EN).toEqual({ status: 'known', updatedAt: 12345 })
    expect(getLanguageStatus(next, TOPIC, 'dog', 'PT')).toBe('unseen')
  })

  it("applyLanguageStatusChange('unseen') removes the language slot", () => {
    const seed = applyLanguageStatusChange({}, TOPIC, 'dog', 'EN', 'known', 1)
    const next = applyLanguageStatusChange(seed, TOPIC, 'dog', 'EN', 'unseen')
    expect(next.animals?.dog?.EN).toBeUndefined()
    expect(next.animals).toBeUndefined()
  })

  it('applyLanguageStatusChange does not mutate the input', () => {
    const seed = applyLanguageStatusChange({}, TOPIC, 'dog', 'EN', 'known', 1)
    const before = JSON.stringify(seed)
    applyLanguageStatusChange(seed, TOPIC, 'dog', 'PT', 'learning', 2)
    expect(JSON.stringify(seed)).toBe(before)
  })

  it('conceptStudyAggregateStatus: any learning wins', () => {
    let s = applyLanguageStatusChange({}, TOPIC, 'dog', 'EN', 'known', 1)
    s = applyLanguageStatusChange(s, TOPIC, 'dog', 'PT', 'learning', 2)
    expect(conceptStudyAggregateStatus(s, TOPIC, 'dog', ['EN', 'PT'])).toBe('learning')
  })

  it('conceptStudyAggregateStatus: known only when all langs known', () => {
    let s = applyLanguageStatusChange({}, TOPIC, 'dog', 'EN', 'known', 1)
    expect(conceptStudyAggregateStatus(s, TOPIC, 'dog', ['EN', 'PT'])).toBe('unseen')
    s = applyLanguageStatusChange(s, TOPIC, 'dog', 'PT', 'known', 2)
    expect(conceptStudyAggregateStatus(s, TOPIC, 'dog', ['EN', 'PT'])).toBe('known')
  })

  it('conceptStudyAggregateUpdatedAt uses max when all known', () => {
    let s = applyLanguageStatusChange({}, TOPIC, 'dog', 'EN', 'known', 10)
    s = applyLanguageStatusChange(s, TOPIC, 'dog', 'PT', 'known', 50)
    expect(conceptStudyAggregateUpdatedAt(s, TOPIC, 'dog', ['EN', 'PT'])).toBe(50)
  })
})
