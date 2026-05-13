import { languageOrder, topics, topicWords, type LanguageCode, type TopicSlug, type TopicWord } from '../data/words'
import { latinFoldForSearch } from './latinFold'

export type WordSearchHit = {
  topicSlug: TopicSlug
  concept: string
  word: TopicWord
  /** Languages whose form, article, or example matched the query (subset of `languageOrder`). */
  matchedLanguages: LanguageCode[]
  /** Higher sorts first: exact form > exact concept > prefix > substring. */
  score: number
}

const topicIndexBySlug = new Map(topics.map((t, i) => [t.slug, i]))

function normalizeToken(s: string): string {
  return latinFoldForSearch(s)
}

function collectSearchableStrings(word: TopicWord): { lang: LanguageCode; text: string }[] {
  const out: { lang: LanguageCode; text: string }[] = []
  out.push({ lang: 'EN', text: word.concept })
  for (const lang of languageOrder) {
    const form = word.forms[lang]
    if (form) out.push({ lang, text: form })
    const art = word.articles?.[lang]
    if (art) out.push({ lang, text: art })
    const sentence = word.examples?.[lang]
    if (sentence?.trim()) out.push({ lang, text: sentence })
  }
  return out
}

function scoreForMatch(query: string, text: string): number {
  const t = normalizeToken(text)
  const q = normalizeToken(query)
  if (!q || !t) return 0
  if (t === q) return 100
  if (t.startsWith(q)) return 40
  if (t.includes(q)) return 10
  return 0
}

/**
 * Search all topics for words whose concept, surface forms, articles, or example sentences match `query`.
 * Results are sorted by score (desc), then topic order, then concept.
 */
export function searchVocabulary(query: string, limit = 24): WordSearchHit[] {
  const q = normalizeToken(query)
  if (!q) return []

  const hits: WordSearchHit[] = []

  for (const topic of topics) {
    const rows = topicWords[topic.slug]
    for (const word of rows) {
      const matchedLanguages = new Set<LanguageCode>()
      let best = 0
      for (const { lang, text } of collectSearchableStrings(word)) {
        const s = scoreForMatch(query, text)
        if (s > 0) {
          matchedLanguages.add(lang)
          if (s > best) best = s
        }
      }
      if (best > 0) {
        hits.push({
          topicSlug: topic.slug,
          concept: word.concept,
          word,
          matchedLanguages: languageOrder.filter((l) => matchedLanguages.has(l)),
          score: best,
        })
      }
    }
  }

  const topicOrder = (slug: TopicSlug) => topicIndexBySlug.get(slug) ?? 999

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const td = topicOrder(a.topicSlug) - topicOrder(b.topicSlug)
    if (td !== 0) return td
    return a.concept.localeCompare(b.concept)
  })

  return hits.slice(0, limit)
}
