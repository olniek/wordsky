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
npm run lint:topic-data   # topic row structure (mapGroup, examples, corpus bounds, …); Vitest adds Study-ready strings (see topicWordIntegrity.ts)
npm run corpus:examples   # validate corpusExamples blocks (optional JSON path argument)
npm run recognition:qa  # dev: high fuzzy recognition hits per target language
```

## Where things live

### Source layout (`src/`)

- **`app/`** — Vite entry (`main.tsx`), root `App`, and React Router routes.
- **`components/`** — UI grouped by area: `shell/` (error boundary, storage/PWA banners), `welcome/`, `topic-hub/` (topic list + search), `topic/` (topic shell, Study card, tabs), `map/` (React Flow graph), `recognition/`, `language/` (anchor + translation pickers).
- **`lib/`**, **`data/`**, **`hooks/`** — domain logic, vocabulary and topics, shared React hooks.

| Area | Location |
|------|----------|
| Topic registry, types, `MAP_GROUP_ORDER`, merged `topicWords` | [src/data/words.ts](src/data/words.ts) |
| Everyday nouns (100 words, split module) | [src/data/topicEverydayNouns100.ts](src/data/topicEverydayNouns100.ts) |
| Study-ready row checklist (`collectTopicWordStudyDataIssues`) | [src/data/topicWordIntegrity.ts](src/data/topicWordIntegrity.ts) |
| Topic data Vitest (registry, uniqueness, guided order, Study checklist, …) | [src/data/words.test.ts](src/data/words.test.ts) |
| Corpus-style extra sentences (authoring + pipeline) | [src/data/corpus/README.md](src/data/corpus/README.md), `npm run corpus:examples` |
| Latin accent / ß folding (search + lemma compare) | [src/lib/latinFold.ts](src/lib/latinFold.ts) |
| Cognate similarity + `false-friend-*` tags | [src/lib/crossLangLemmaAffinity.ts](src/lib/crossLangLemmaAffinity.ts) |
| Find a word (topic hub) | [src/lib/wordSearch.ts](src/lib/wordSearch.ts), [src/components/topic-hub/WordSearch.tsx](src/components/topic-hub/WordSearch.tsx) |
| Welcome (language setup), optional constellation | [src/components/welcome/WelcomeLanding.tsx](src/components/welcome/WelcomeLanding.tsx), [src/components/welcome/WelcomeConstellations.tsx](src/components/welcome/WelcomeConstellations.tsx) |
| Languages you know (storage + hook) | [src/lib/knownLanguages.ts](src/lib/knownLanguages.ts), [src/components/recognition/KnownLanguagesPicker.tsx](src/components/recognition/KnownLanguagesPicker.tsx) |
| Recognition strip + report (`/recognize/:target`) | [src/components/recognition/RecognitionStrip.tsx](src/components/recognition/RecognitionStrip.tsx), [src/components/recognition/RecognitionReport.tsx](src/components/recognition/RecognitionReport.tsx), [src/lib/recognition/](src/lib/recognition/) |
| Study card (markup + scoped CSS: `study-*`, `speak-button`) | [src/components/topic/StudyCard.tsx](src/components/topic/StudyCard.tsx), [src/index.css](src/index.css) |
| UI strings | [src/lib/strings.ts](src/lib/strings.ts) |

## Roadmap (graded vocabulary / CEFRLex-style)

MVP uses **manual** A1 checks when curating data. **Planned** automation (optional `cefrHint`, cross-language QA, offline scripts) is documented as ordered tasks in [.cursor/rules/words-sky-topic-data.mdc](.cursor/rules/words-sky-topic-data.mdc) (*A1 level checks*). Product-level deferral: [UX.md](UX.md) §9.

## Cursor skills

Map layout, copy, PM check, and PWA notes live under [.cursor/skills/](.cursor/skills/). The PM check skill keeps long checklists and the review output template under [.cursor/skills/words-sky-pm-check/references/](.cursor/skills/words-sky-pm-check/references/).
