/**
 * Minimal shape for picking a voice from `SpeechSynthesis.getVoices()` or tests.
 */
export type SpeechVoiceLike = {
  lang: string
  localService?: boolean
  name?: string
}

function normalizeTag(tag: string): string {
  return tag.trim().replace(/_/g, '-')
}

function primarySubtag(lang: string): string {
  const part = normalizeTag(lang).split('-')[0]
  return part ? part.toLowerCase() : ''
}

function targetMatchesVoice(targetBcp47: string, voiceLang: string): boolean {
  return primarySubtag(voiceLang) === primarySubtag(targetBcp47)
}

/** macOS / system novelty or legacy voices that read study text poorly if picked first. */
function isUndesirableEnglishTtsName(name: string | undefined): boolean {
  if (!name) return false
  const n = name.toLowerCase()
  return /\b(albert|bad news|bells|blockbuster|boing|bubbles|cellos|deranged|eddy|flo|fred|good news|grandma|grandpa|heroes|hysterical|jester|junior|kathy|organ\b|pipe organ|princess|ralph|reed\b|rocko|sally|sandy|shelley|superstar|tremulous|trinoids|whisper|zarvox)\b/.test(
    n,
  )
}

/** Obvious low-quality / embedded engines — deprioritize after normal voices. */
function isSuspiciousEnglishTtsName(name: string | undefined): boolean {
  if (!name) return false
  const n = name.toLowerCase()
  return /\b(espeak|pico|flite|festival|compact)\b/.test(n)
}

/**
 * Mainstream US/UK English voices that sound like “default” system or browser TTS.
 * Used so we do not pick the first cloud voice alphabetically (often odd on some Chrome builds).
 */
function isPreferredStandardEnglishTtsName(name: string | undefined): boolean {
  if (!name) return false
  const n = name.toLowerCase()
  return (
    /google\s*(english\s*\(united states\)|us\s*english)/.test(n) ||
    /microsoft\s+(aria|jenny|guy|davis|michelle|christopher|mark|zira)\b/.test(n) ||
    /\b(samantha|alex)\b/.test(n) ||
    /chrome\s*os[^\n]*(us|united states)/.test(n)
  )
}

/**
 * Pick the best voice for a BCP-47 tag (e.g. `fr-FR`) from an engine voice list.
 * Prefer same primary language, exact region match, then local (offline) voices,
 * then deterministic tie-break. For English, skip novelty/legacy voices, prefer
 * known standard voices (Google US English, Microsoft neural, Samantha, Alex, …),
 * then prefer **local** voices over arbitrary cloud voices (avoids odd first-by-name picks).
 */
export function pickSpeechVoice(
  voices: SpeechVoiceLike[],
  bcp47: string,
): SpeechVoiceLike | undefined {
  const targetNorm = normalizeTag(bcp47).toLowerCase()
  const isEnglish = primarySubtag(bcp47) === 'en'
  let candidates = voices.filter((v) => targetMatchesVoice(bcp47, v.lang))
  if (candidates.length === 0) return undefined

  if (isEnglish) {
    const withoutRot = candidates.filter((v) => !isUndesirableEnglishTtsName(v.name))
    if (withoutRot.length > 0) candidates = withoutRot
  }

  const score = (v: SpeechVoiceLike): [number, number, number, number, string, string] => {
    const vNorm = normalizeTag(v.lang).toLowerCase()
    const exact = vNorm === targetNorm ? 0 : 1
    if (isEnglish) {
      const name = v.name
      const stdTier = isSuspiciousEnglishTtsName(name)
        ? 2
        : isPreferredStandardEnglishTtsName(name)
          ? 0
          : 1
      // Among “normal” English voices, OS/bundled voices beat random remote voices.
      const localPreferred = stdTier === 1 ? (v.localService === true ? 0 : 1) : 0
      return [exact, stdTier, localPreferred, v.localService === true ? 0 : 1, v.lang.toLowerCase(), (v.name ?? '').toLowerCase()]
    }
    const preferLocal = v.localService === true ? 0 : 1
    return [exact, 0, 0, preferLocal, v.lang.toLowerCase(), (v.name ?? '').toLowerCase()]
  }

  candidates.sort((a, b) => {
    const sa = score(a)
    const sb = score(b)
    for (let i = 0; i < sa.length; i++) {
      if (sa[i]! < sb[i]!) return -1
      if (sa[i]! > sb[i]!) return 1
    }
    return 0
  })

  return candidates[0]
}
