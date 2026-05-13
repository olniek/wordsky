import type { LanguageCode } from '../data/words'
import { pickSpeechVoice } from './speechVoice'

/**
 * Best-effort BCP-47 tags for the SpeechSynthesis API. Browsers fall back to
 * the closest installed voice; "pt-PT" tends to sound more A1-friendly than
 * "pt-BR" but either works.
 */
const SPEECH_LANG: Record<LanguageCode, string> = {
  EN: 'en-US',
  DE: 'de-DE',
  PT: 'pt-PT',
  ES: 'es-ES',
  FR: 'fr-FR',
  IT: 'it-IT',
}

let voicesWarmupAttached = false

type PendingSpeak = { text: string; lang: LanguageCode }
let pendingSpeak: PendingSpeak | null = null
let pendingTimer: ReturnType<typeof setTimeout> | null = null

function clearPendingTimer(): void {
  if (pendingTimer !== null) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }
}

function flushPending(): void {
  clearPendingTimer()
  const p = pendingSpeak
  pendingSpeak = null
  if (p) speakImmediate(p.text, p.lang)
}

function ensureVoicesWarmup(): void {
  if (!isSpeechSupported() || voicesWarmupAttached) return
  voicesWarmupAttached = true
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    if (pendingSpeak && window.speechSynthesis.getVoices().length > 0) {
      flushPending()
    }
  })
}

function speakImmediate(text: string, lang: LanguageCode): void {
  try {
    window.speechSynthesis.cancel()
    const bcp47 = SPEECH_LANG[lang]
    const voices = window.speechSynthesis.getVoices()
    const picked = pickSpeechVoice(voices, bcp47)
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = bcp47
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onerror = () => {
      // Best-effort speech — swallow async errors so they don't surface as unhandled.
    }
    if (picked) {
      // `picked` is a reference from `getVoices()` at runtime.
      utterance.voice = picked as SpeechSynthesisVoice
    }
    window.speechSynthesis.speak(utterance)
  } catch {
    // ignore — non-fatal
  }
}

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  )
}

export function speak(text: string, lang: LanguageCode): void {
  if (!isSpeechSupported()) return
  ensureVoicesWarmup()
  try {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      clearPendingTimer()
      pendingSpeak = null
      speakImmediate(text, lang)
      return
    }

    pendingSpeak = { text, lang }
    clearPendingTimer()
    pendingTimer = setTimeout(() => flushPending(), 350)
  } catch {
    // ignore — non-fatal
  }
}
