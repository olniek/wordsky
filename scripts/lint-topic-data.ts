/**
 * Structural QA for topic data aggregated in `src/data/words.ts` (`topicWords`),
 * including rows authored in imported modules (e.g. `topicEverydayNouns100.ts`).
 * Run: npm run lint:topic-data
 */
import {
  MAP_GROUP_ORDER,
  languageOrder,
  topicWords,
  type LanguageCode,
  type TopicSlug,
} from '../src/data/words'

const slugs = Object.keys(topicWords) as TopicSlug[]

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
    if (ex !== undefined && Object.keys(ex).length > 0) {
      for (const code of languageOrder) {
        const s = ex[code as LanguageCode]
        if (s === undefined || String(s).trim() === '') {
          fail(
            `${loc}: examples must include all languages with non-empty strings when any example is set (missing or empty: ${code})`,
          )
          errors += 1
        }
      }
    }
  }
}

if (errors > 0) {
  console.error(`\nlint-topic-data: ${errors} error(s)`)
  process.exit(1)
}

console.log('lint-topic-data: OK')
