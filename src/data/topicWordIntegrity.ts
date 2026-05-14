import { displayWordForm } from '../lib/wordForm'
import { languageOrder, type LanguageCode, type TopicSlug, type TopicWord } from './words'

/**
 * Single checklist for a `TopicWord` row: translations, example lines (Study + listen),
 * articles, map band, and optional corpus shape. Use from tests (and optionally scripts)
 * so new cards fail in one place instead of duplicating field-by-field assertions.
 */
export function collectTopicWordStudyDataIssues(
  topicSlug: TopicSlug,
  row: TopicWord,
  allowedMapGroups: ReadonlySet<string>,
): string[] {
  const issues: string[] = []
  const loc = `${topicSlug}/${row.concept}`

  if (!row.concept?.trim()) {
    issues.push(`${loc}: empty concept`)
  }

  if (!row.mapGroup?.trim()) {
    issues.push(`${loc}: empty mapGroup`)
  } else if (!allowedMapGroups.has(row.mapGroup)) {
    issues.push(`${loc}: unknown mapGroup "${row.mapGroup}"`)
  }

  for (const lang of languageOrder) {
    const lemma = row.forms[lang]
    if (lemma === undefined || String(lemma).trim() === '') {
      issues.push(`${loc}: missing translation (forms.${lang})`)
    }
  }

  const ex = row.examples
  if (ex === undefined || Object.keys(ex).length === 0) {
    issues.push(`${loc}: examples is required (six languages)`)
  } else {
    for (const lang of languageOrder) {
      const s = ex[lang as LanguageCode]
      if (s === undefined || String(s).trim() === '') {
        issues.push(`${loc}: missing or empty example sentence (examples.${lang})`)
      }
    }
  }

  if (!row.articles) {
    issues.push(`${loc}: missing articles (required for all six languages)`)
  } else {
    for (const lang of languageOrder) {
      if (!row.articles[lang]?.trim()) {
        issues.push(`${loc}: missing article (${lang})`)
      }
    }
  }

  for (const lang of languageOrder) {
    const spoken = displayWordForm(row, lang).trim()
    if (!spoken) {
      issues.push(`${loc}: empty speakable surface for ${lang} (forms + article)`)
    }
  }

  const corpus = row.corpusExamples
  if (corpus !== undefined && Object.keys(corpus).length > 0) {
    for (const lang of languageOrder) {
      const list = corpus[lang]
      if (list === undefined) continue
      if (!Array.isArray(list) || list.length === 0 || list.length > 5) {
        issues.push(`${loc}: corpusExamples.${lang} must have 1–5 items when set`)
        continue
      }
      for (let j = 0; j < list.length; j += 1) {
        const line = list[j]
        if (typeof line !== 'string' || !line.trim()) {
          issues.push(`${loc}: corpusExamples.${lang}[${j}] must be non-empty`)
        }
      }
    }
  }

  return issues
}
