/**
 * Structural QA for topic data aggregated in `src/data/words.ts` (`topicWords`),
 * including rows authored in imported modules (e.g. `topicEverydayNouns100.ts`).
 * Run: npm run lint:topic-data
 */
import {
  MAP_GROUP_ORDER,
  cefrHintLevels,
  languageOrder,
  topicWords,
  type LanguageCode,
  type TopicSlug,
} from '../src/data/words'

const slugs = Object.keys(topicWords) as TopicSlug[]
const allowedCefrHints = new Set<string>(cefrHintLevels)

function fail(msg: string) {
  console.error(msg)
}

let errors = 0

for (const slug of slugs) {
  const words = topicWords[slug]
  const allowedGroups = new Set(MAP_GROUP_ORDER[slug])
  const seenConcept = new Set<string>()

  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const loc = `${slug}[${i}] concept="${w.concept}"`

    if (seenConcept.has(w.concept)) {
      fail(`${loc}: duplicate concept key "${w.concept}" in topic`)
      errors += 1
    }
    seenConcept.add(w.concept)

    if (!allowedGroups.has(w.mapGroup)) {
      fail(
        `${loc}: mapGroup "${w.mapGroup}" is not in MAP_GROUP_ORDER.${slug} (${[...MAP_GROUP_ORDER[slug]].join(', ')})`,
      )
      errors += 1
    }

    for (const code of languageOrder) {
      const lemma = w.forms[code as LanguageCode]
      if (lemma === undefined || String(lemma).trim() === '') {
        fail(`${loc}: missing or empty forms.${code}`)
        errors += 1
      }
    }

    const ex = w.examples
    if (ex === undefined || Object.keys(ex).length === 0) {
      fail(`${loc}: examples is required on every TopicWord`)
      errors += 1
    } else {
      for (const code of languageOrder) {
        const s = ex[code as LanguageCode]
        if (s === undefined || String(s).trim() === '') {
          fail(
            `${loc}: examples must include all languages with non-empty strings (missing or empty: ${code})`,
          )
          errors += 1
        }
      }
    }

    const corpus = w.corpusExamples
    if (corpus !== undefined && Object.keys(corpus).length > 0) {
      for (const [codeRaw, list] of Object.entries(corpus)) {
        const code = codeRaw as LanguageCode
        if (!languageOrder.includes(code)) {
          fail(`${loc}: corpusExamples has unknown language key "${codeRaw}"`)
          errors += 1
          continue
        }
        if (!Array.isArray(list) || list.length === 0) {
          fail(`${loc}: corpusExamples.${code} must be a non-empty array`)
          errors += 1
          continue
        }
        if (list.length > 5) {
          fail(`${loc}: corpusExamples.${code} must have at most 5 sentences (got ${list.length})`)
          errors += 1
        }
        for (let j = 0; j < list.length; j++) {
          const line = list[j]
          if (typeof line !== 'string' || line.trim() === '') {
            fail(`${loc}: corpusExamples.${code}[${j}] must be a non-empty string`)
            errors += 1
          }
        }
      }
    }

    if (w.corpusMeta !== undefined) {
      const m = w.corpusMeta
      if (!m || typeof m.sourceId !== 'string' || m.sourceId.trim() === '') {
        fail(`${loc}: corpusMeta.sourceId must be a non-empty string when corpusMeta is set`)
        errors += 1
      }
      if (!m || typeof m.licensedAs !== 'string' || m.licensedAs.trim() === '') {
        fail(`${loc}: corpusMeta.licensedAs must be a non-empty string when corpusMeta is set`)
        errors += 1
      }
    }

    if (w.cefrHint !== undefined && !allowedCefrHints.has(w.cefrHint)) {
      fail(
        `${loc}: cefrHint "${w.cefrHint}" is not one of ${[...cefrHintLevels].join(', ')}`,
      )
      errors += 1
    }
  }
}

if (errors > 0) {
  console.error(`\nlint-topic-data: ${errors} error(s)`)
  process.exit(1)
}

console.log('lint-topic-data: OK')
