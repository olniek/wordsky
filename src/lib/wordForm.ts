import type { LanguageCode, TopicWord } from '../data/words'

/** Lemma plus optional article (e.g. `der Baum`) for display and speech. */
export function displayWordForm(word: TopicWord, lang: LanguageCode): string {
  const article = word.articles?.[lang]?.trim()
  if (!article) return word.forms[lang]
  const lemma = word.forms[lang]
  const elided = article.endsWith("'") || article.endsWith('\u2019')
  if (elided) return `${article}${lemma}`
  return `${article} ${lemma}`
}
