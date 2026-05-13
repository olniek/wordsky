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
  return /\b(albert|bad news|boing|bubbles|cellos|deranged|fred|hysterical|junior|kathy|organ\b|pipe organ|princess|ralph|reed\b|rocko|tremulous|whisper|zarvox)\b/.test(
    n,
  )
}

function prefersNonLocalOverLocal(bcp47: string): boolean {
  // Neural / cloud English voices are usually clearer than bundled offline ones.
  return primarySubtag(bcp47) === 'en'
}

/**
 * Pick the best voice for a BCP-47 tag (e.g. `fr-FR`) from an engine voice list.
 * Prefer same primary language, exact region match, then local (offline) voices,
 * then deterministic tie-break. For English, skip common novelty/legacy voices and
 * prefer non-local (e.g. browser neural) when available.
 */
export function pickSpeechVoice(
  voices: SpeechVoiceLike[],
  bcp47: string,
): SpeechVoiceLike | undefined {
  const targetNorm = normalizeTag(bcp47).toLowerCase()
  let candidates = voices.filter((v) => targetMatchesVoice(bcp47, v.lang))
  if (candidates.length === 0) return undefined

  if (prefersNonLocalOverLocal(bcp47)) {
    const withoutRot = candidates.filter((v) => !isUndesirableEnglishTtsName(v.name))
    if (withoutRot.length > 0) candidates = withoutRot
  }

  const score = (v: SpeechVoiceLike): [number, number, string, string] => {
    const vNorm = normalizeTag(v.lang).toLowerCase()
    const exact = vNorm === targetNorm ? 0 : 1
    const nonLocalFirst = prefersNonLocalOverLocal(bcp47)
      ? v.localService === true
        ? 1
        : 0
      : v.localService === true
        ? 0
        : 1
    return [exact, nonLocalFirst, v.lang.toLowerCase(), (v.name ?? '').toLowerCase()]
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
