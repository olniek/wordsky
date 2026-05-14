import type { LanguageCode } from '../../data/words'
import type { LangPair } from './types'

type PatternRule = { from: RegExp; to: string }

// Keep tables small (<=6 rules per pair). A1 is mostly short concrete nouns so
// most "recognition" comes from identical-after-fold + tag-driven cognates.
// Rules below are deliberately conservative (high-yield) to avoid false hits.
const PATTERNS: Partial<Record<LangPair, PatternRule[]>> = {
  'EN-PT': [
    { from: /tion$/i, to: 'ção' },
    { from: /sion$/i, to: 'são' },
    { from: /ph/gi, to: 'f' },
    { from: /^h(?=[aeiou])/i, to: '' },
  ],
  'EN-ES': [
    { from: /tion$/i, to: 'ción' },
    { from: /sion$/i, to: 'sión' },
    { from: /ph/gi, to: 'f' },
  ],
  'EN-IT': [
    { from: /tion$/i, to: 'zione' },
    { from: /ph/gi, to: 'f' },
  ],
  'EN-FR': [
    { from: /tion$/i, to: 'tion' },
    { from: /ph/gi, to: 'f' },
    { from: /y$/i, to: 'ie' },
  ],
  'EN-DE': [
    { from: /^th/i, to: 'd' },
    { from: /ph/gi, to: 'f' },
    { from: /c(?=[aou])/gi, to: 'k' },
  ],
  'PT-ES': [
    { from: /ção$/i, to: 'ción' },
    { from: /são$/i, to: 'sión' },
    { from: /dade$/i, to: 'dad' },
    { from: /lh/gi, to: 'll' },
    { from: /nh/gi, to: 'ñ' },
  ],
  'PT-IT': [
    { from: /ção$/i, to: 'zione' },
    { from: /lh/gi, to: 'gli' },
  ],
  'ES-IT': [
    { from: /ción$/i, to: 'zione' },
    { from: /ll/gi, to: 'gli' },
  ],
  'ES-FR': [
    { from: /ción$/i, to: 'tion' },
    { from: /dad$/i, to: 'té' },
  ],
  'PT-FR': [
    { from: /ção$/i, to: 'tion' },
    { from: /dade$/i, to: 'té' },
  ],
  'IT-FR': [
    { from: /zione$/i, to: 'tion' },
    { from: /tà$/i, to: 'té' },
  ],
}

function reverseRule(rule: PatternRule): PatternRule | null {
  // Only reverse rules whose `from` is a plain string-anchored regex we can mirror safely.
  // For the simple replace-suffix and replace-letter rules above we can reverse by escaping `to`.
  const source = rule.from.source
  const flags = rule.from.flags
  // Anchored suffix (...$) → swap, keep anchor
  if (source.endsWith('$')) {
    const escaped = rule.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return { from: new RegExp(escaped + '$', flags), to: source.slice(0, -1) }
  }
  // Anchored prefix (^...) → swap, keep anchor
  if (source.startsWith('^') && !source.includes('(?')) {
    const escaped = rule.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return { from: new RegExp('^' + escaped, flags), to: source.slice(1) }
  }
  // Plain letter swap (e.g. /ph/gi) → reverse to /f/gi → 'ph'
  if (!source.includes('\\') && !source.includes('(') && !source.includes('[')) {
    const escaped = rule.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return { from: new RegExp(escaped, flags), to: source }
  }
  return null
}

function getRules(pair: LangPair): PatternRule[] {
  const direct = PATTERNS[pair]
  if (direct) return direct
  const [a, b] = pair.split('-') as [LanguageCode, LanguageCode]
  const reverse = PATTERNS[`${b}-${a}` as LangPair]
  if (!reverse) return []
  const reversed: PatternRule[] = []
  for (const rule of reverse) {
    const r = reverseRule(rule)
    if (r) reversed.push(r)
  }
  return reversed
}

/**
 * Apply each rule for `pair` independently to `word`, returning unique candidate
 * transforms (including the input). Each candidate is a plausible spelling in the
 * `pair[1]` language assuming one well-known regular sound/orthographic shift.
 */
export function applyPatterns(word: string, pair: LangPair): string[] {
  const rules = getRules(pair)
  const out = new Set<string>([word])
  for (const rule of rules) {
    const swapped = word.replace(rule.from, rule.to)
    if (swapped && swapped !== word) out.add(swapped)
  }
  return [...out]
}

/** True if at least one pattern rule exists for the given pair (or its reverse). */
export function hasPatternsFor(pair: LangPair): boolean {
  return getRules(pair).length > 0
}
