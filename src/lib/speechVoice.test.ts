import { describe, expect, it } from 'vitest'
import { pickSpeechVoice, type SpeechVoiceLike } from './speechVoice'

describe('pickSpeechVoice', () => {
  it('returns undefined when the list is empty', () => {
    expect(pickSpeechVoice([], 'fr-FR')).toBeUndefined()
  })

  it('returns undefined when no voice matches the primary language', () => {
    const voices: SpeechVoiceLike[] = [{ lang: 'en-US' }, { lang: 'de-DE' }]
    expect(pickSpeechVoice(voices, 'fr-FR')).toBeUndefined()
  })

  it('picks fr-FR when both en-US and fr-FR exist', () => {
    const voices: SpeechVoiceLike[] = [{ lang: 'en-US' }, { lang: 'fr-FR', name: 'Thomas' }]
    expect(pickSpeechVoice(voices, 'fr-FR')).toEqual(voices[1])
  })

  it('picks fr-CA when fr-FR is requested but only fr-CA exists', () => {
    const frCa: SpeechVoiceLike = { lang: 'fr-CA', name: 'Amelie' }
    const voices: SpeechVoiceLike[] = [{ lang: 'en-US' }, frCa]
    expect(pickSpeechVoice(voices, 'fr-FR')).toBe(frCa)
  })

  it('prefers exact fr-FR over fr-CA when both exist', () => {
    const frFr: SpeechVoiceLike = { lang: 'fr-FR', name: 'Daniel' }
    const frCa: SpeechVoiceLike = { lang: 'fr-CA', name: 'Amelie' }
    const voices: SpeechVoiceLike[] = [frCa, frFr]
    expect(pickSpeechVoice(voices, 'fr-FR')).toBe(frFr)
  })

  it('prefers localService among duplicate fr-FR tags', () => {
    const cloud: SpeechVoiceLike = { lang: 'fr-FR', name: 'Z', localService: false }
    const local: SpeechVoiceLike = { lang: 'fr-FR', name: 'A', localService: true }
    const voices: SpeechVoiceLike[] = [cloud, local]
    expect(pickSpeechVoice(voices, 'fr-FR')).toBe(local)
  })

  it('treats underscore locales like hyphen locales', () => {
    const frFr: SpeechVoiceLike = { lang: 'fr_FR', name: 'Daniel' }
    expect(pickSpeechVoice([frFr], 'fr-FR')).toBe(frFr)
  })

  it('for en-US avoids novelty/legacy English voices when a normal voice exists', () => {
    const albert: SpeechVoiceLike = { lang: 'en-US', name: 'Albert', localService: true }
    const samantha: SpeechVoiceLike = { lang: 'en-US', name: 'Samantha', localService: true }
    const voices: SpeechVoiceLike[] = [albert, samantha]
    expect(pickSpeechVoice(voices, 'en-US')).toBe(samantha)
  })

  it('for en-US prefers local when both are generic cloud/local names (avoids odd cloud defaults)', () => {
    const local: SpeechVoiceLike = { lang: 'en-US', name: 'Local Voice', localService: true }
    const cloud: SpeechVoiceLike = { lang: 'en-US', name: 'Cloud Voice', localService: false }
    const voices: SpeechVoiceLike[] = [local, cloud]
    expect(pickSpeechVoice(voices, 'en-US')).toBe(local)
  })

  it('for en-US prefers a known standard voice over alphabetical generic cloud', () => {
    const genericCloud: SpeechVoiceLike = { lang: 'en-US', name: 'Aaron', localService: false }
    const googleUs: SpeechVoiceLike = {
      lang: 'en-US',
      name: 'Google US English',
      localService: false,
    }
    const voices: SpeechVoiceLike[] = [genericCloud, googleUs]
    expect(pickSpeechVoice(voices, 'en-US')).toBe(googleUs)
  })

  it('for en-US deprioritizes suspicious engine names when a normal voice exists', () => {
    const espeak: SpeechVoiceLike = { lang: 'en-US', name: 'espeak US', localService: true }
    const normal: SpeechVoiceLike = { lang: 'en-US', name: 'Some English Voice', localService: true }
    const voices: SpeechVoiceLike[] = [espeak, normal]
    expect(pickSpeechVoice(voices, 'en-US')).toBe(normal)
  })
})
