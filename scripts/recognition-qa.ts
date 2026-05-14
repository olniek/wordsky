/**
 * Dev helper: scan the A1 recognition corpus for surprising fuzzy matches.
 * Run: npm run recognition:qa
 */
import { languageOrder } from '../src/data/words'
import { getA1Corpus, summarize } from '../src/lib/recognition'

const HIGH_FUZZY = 88

function main() {
  const corpus = getA1Corpus()
  console.log(`Corpus: ${corpus.length} concepts (deduped)\n`)

  for (const target of languageOrder) {
    const known = languageOrder.filter((c) => c !== target)
    const s = summarize(target, known)
    const fuzzyHigh = s.words.filter((w) => w.matchedRule === 'fuzzy' && w.score >= HIGH_FUZZY)
    console.log(`Target ${target} (known all others): ${s.recognitionPercent}% · fuzzy≥${HIGH_FUZZY}: ${fuzzyHigh.length}`)
    for (const w of fuzzyHigh.slice(0, 12)) {
      console.log(
        `  · ${w.concept}: ${w.targetForm} ← ${w.matchedForm} (${w.matchedVia}) score=${w.score}`,
      )
    }
    if (fuzzyHigh.length > 12) console.log(`  … +${fuzzyHigh.length - 12} more`)
    console.log('')
  }
}

main()
