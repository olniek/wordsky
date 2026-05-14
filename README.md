# Words Sky

A1 vocabulary across six languages (English, German, Portuguese, Spanish, French, Italian). **Product rulebook:** [UX.md](UX.md). **Known languages & recognition (persistence, scoring, UI):** [docs/known-languages-and-recognition.md](docs/known-languages-and-recognition.md). **Topic data conventions:** [.cursor/rules/words-sky-topic-data.mdc](.cursor/rules/words-sky-topic-data.mdc).

## Flow

`Welcome → Topic hub → Topic → Study → (optional) Map` — see UX.md for copy, gestures, out-of-scope items (§8), and deferred graded-vocabulary tooling (§9).

## Scripts

```bash
npm run dev      # local dev
npm run build    # production build
npm run test     # Vitest
npm run lint     # ESLint
npm run lint:topic-data   # topic row structure (mapGroup, required six-language examples, …)
npm run corpus:examples   # validate corpusExamples blocks (optional JSON path argument)
npm run recognition:qa  # dev: high fuzzy recognition hits per target language
```

## Where things live

| Area | Location |
|------|----------|
| Topic registry, types, `MAP_GROUP_ORDER`, merged `topicWords` | [src/data/words.ts](src/data/words.ts) |
| Everyday nouns (100 words, split module) | [src/data/topicEverydayNouns100.ts](src/data/topicEverydayNouns100.ts) |
| Data invariants (forms, examples, articles, groups) | [src/data/words.test.ts](src/data/words.test.ts) |
| Corpus-style extra sentences (authoring + pipeline) | [src/data/corpus/README.md](src/data/corpus/README.md), `npm run corpus:examples` |
| Latin accent / ß folding (search + lemma compare) | [src/lib/latinFold.ts](src/lib/latinFold.ts) |
| Cognate similarity + `false-friend-*` tags | [src/lib/crossLangLemmaAffinity.ts](src/lib/crossLangLemmaAffinity.ts) |
| Find a word (landing) | [src/lib/wordSearch.ts](src/lib/wordSearch.ts), [src/components/WordSearch.tsx](src/components/WordSearch.tsx) |
| Welcome (language setup), optional constellation | [src/components/WelcomeLanding.tsx](src/components/WelcomeLanding.tsx), [src/components/WelcomeConstellations.tsx](src/components/WelcomeConstellations.tsx) |
| Languages you already know (storage + hook) | [src/lib/knownLanguages.ts](src/lib/knownLanguages.ts), [src/components/KnownLanguagesPicker.tsx](src/components/KnownLanguagesPicker.tsx) |
| Recognition strip + report (`/recognize/:target`) | [src/components/RecognitionStrip.tsx](src/components/RecognitionStrip.tsx), [src/components/RecognitionReport.tsx](src/components/RecognitionReport.tsx), [src/lib/recognition/](src/lib/recognition/) |
| Study card (markup + scoped CSS: `study-*`, `speak-button`) | [src/components/StudyCard.tsx](src/components/StudyCard.tsx), [src/index.css](src/index.css) |
| UI strings | [src/lib/strings.ts](src/lib/strings.ts) |

## Roadmap (graded vocabulary / CEFRLex-style)

MVP uses **manual** A1 checks when curating data. **Planned** automation (optional `cefrHint`, cross-language QA, offline scripts) is documented as ordered tasks in [.cursor/rules/words-sky-topic-data.mdc](.cursor/rules/words-sky-topic-data.mdc) (*A1 level checks*). Product-level deferral: [UX.md](UX.md) §9.

## Cursor skills

Map layout, copy, PM check, and PWA notes live under [.cursor/skills/](.cursor/skills/). The PM check skill keeps long checklists and the review output template under [.cursor/skills/words-sky-pm-check/references/](.cursor/skills/words-sky-pm-check/references/).
