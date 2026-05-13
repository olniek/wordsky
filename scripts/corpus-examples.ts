/**
 * Validate `corpusExamples` in bundled topic data and optionally validate a JSON import file.
 * Run: npm run corpus:examples
 * Run: npm run corpus:examples -- path/to/payload.json
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { languageOrder, topicWords, type LanguageCode, type TopicSlug } from '../src/data/words'

type CorpusPayload = Record<string, Partial<Record<LanguageCode, string[]>>>

function validateCorpusList(loc: string, code: LanguageCode, list: unknown): string[] {
  const errs: string[] = []
  if (!Array.isArray(list) || list.length === 0) {
    errs.push(`${loc}: corpusExamples.${code} must be a non-empty array`)
    return errs
  }
  if (list.length > 5) {
    errs.push(`${loc}: corpusExamples.${code} must have at most 5 sentences (got ${list.length})`)
  }
  for (let j = 0; j < list.length; j++) {
    const line = list[j]
    if (typeof line !== 'string' || line.trim() === '') {
      errs.push(`${loc}: corpusExamples.${code}[${j}] must be a non-empty string`)
    }
  }
  return errs
}

function validateTopicWords(): string[] {
  const errs: string[] = []
  const slugs = Object.keys(topicWords) as TopicSlug[]
  for (const slug of slugs) {
    const words = topicWords[slug]
    for (let i = 0; i < words.length; i++) {
      const w = words[i]!
      const loc = `${slug}[${i}] concept="${w.concept}"`
      const corpus = w.corpusExamples
      if (corpus === undefined || Object.keys(corpus).length === 0) continue
      for (const [codeRaw, list] of Object.entries(corpus)) {
        const code = codeRaw as LanguageCode
        if (!languageOrder.includes(code)) {
          errs.push(`${loc}: unknown corpusExamples language "${codeRaw}"`)
          continue
        }
        errs.push(...validateCorpusList(loc, code, list))
      }
      if (w.corpusMeta !== undefined) {
        const m = w.corpusMeta
        if (!m.sourceId?.trim()) errs.push(`${loc}: corpusMeta.sourceId must be non-empty`)
        if (!m.licensedAs?.trim()) errs.push(`${loc}: corpusMeta.licensedAs must be non-empty`)
      }
    }
  }
  return errs
}

function findConceptLocation(concept: string): string | undefined {
  for (const slug of Object.keys(topicWords) as TopicSlug[]) {
    const idx = topicWords[slug].findIndex((w) => w.concept === concept)
    if (idx >= 0) return `${slug}[${idx}] concept="${concept}"`
  }
  return undefined
}

function validatePayload(data: CorpusPayload): string[] {
  const errs: string[] = []
  for (const [concept, byLang] of Object.entries(data)) {
    const found = findConceptLocation(concept)
    if (!found) {
      errs.push(`Concept "${concept}" not found in topicWords`)
      continue
    }
    const loc = found
    if (!byLang || typeof byLang !== 'object') {
      errs.push(`${loc}: invalid payload for concept "${concept}"`)
      continue
    }
    for (const [codeRaw, list] of Object.entries(byLang)) {
      const code = codeRaw as LanguageCode
      if (!languageOrder.includes(code)) {
        errs.push(`${loc}: unknown language "${codeRaw}"`)
        continue
      }
      errs.push(...validateCorpusList(loc, code, list))
    }
  }
  return errs
}

const fromBundle = validateTopicWords()
const jsonPath = process.argv[2]
let fromFile: string[] = []
if (jsonPath) {
  const abs = resolve(jsonPath)
  const raw = readFileSync(abs, 'utf8')
  const parsed = JSON.parse(raw) as CorpusPayload
  fromFile = validatePayload(parsed)
}

const all = [...fromBundle, ...fromFile]
if (all.length > 0) {
  for (const e of all) console.error(e)
  console.error(`\ncorpus-examples: ${all.length} error(s)`)
  process.exit(1)
}

console.log('corpus-examples: OK')
if (jsonPath) console.log(`  import file: ${resolve(jsonPath)}`)
