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
})
