---
name: words-sky-topic-cross-check
description: >-
  Runs the same structural and multilingual QA pass across every topic and
  all six language keys (EN, DE, PT, ES, FR, IT). Use when auditing topic data,
  before merging large vocabulary changes, after batch edits, or when the user
  asks to verify topics, examples, map groups, corpus lines, or parity across
  languages.
disable-model-invocation: true
---

# Words Sky — topic cross-check (all topics, all languages)

## When to use

Apply this skill **end-to-end** whenever topic data might drift: new rows, mirror patches, `corpusExamples`, `tags`, or `MAP_GROUP_ORDER` edits. Do not skip steps because a change “looked local”; `lint:topic-data` covers much of the schema, Vitest + [`topicWordIntegrity.ts`](src/data/topicWordIntegrity.ts) covers **Study-ready** surface (including articles and speakable strings), and this checklist covers **meaning and parity**.

## Canonical language set

Treat **`EN`, `DE`, `PT`, `ES`, `FR`, `IT`** as the full set for every row. Order for human review matches code: [`languageOrder`](src/data/words.ts) in `words.ts`.

## Commands (always this order)

Run from repo root; fix failures before reporting “done”.

1. `npm run lint:topic-data` — `concept` uniqueness, `mapGroup` vs `MAP_GROUP_ORDER`, full `examples`, optional `corpusExamples` lengths, `cefrHint`, `corpusMeta`.
2. If `corpusExamples` / `corpusMeta` / files under `src/data/corpus/` changed: `npm run corpus:examples`.
3. `npm run test` — includes `src/data/words.test.ts`, which walks every `TopicWord` through **`collectTopicWordStudyDataIssues`** ([`src/data/topicWordIntegrity.ts`](src/data/topicWordIntegrity.ts)): all six `forms`, `examples`, and **`articles`**, allowed `mapGroup`, non-empty speakable text per language (`displayWordForm`), plus `corpusExamples` bounds when set (Study + Web Speech parity).
4. `npm run build`
5. If TypeScript or topic-adjacent UI changed: `npm run lint`

## Per-topic pass (repeat for each `TopicSlug`)

Use [`TopicSlug`](src/data/words.ts) and the topic sections exported from [`words.ts`](src/data/words.ts) (and [`topicEverydayNouns100.ts`](src/data/topicEverydayNouns100.ts) for the everyday source and mirrors).

For **each** topic’s word list:

- [ ] **`mapGroup`** on every row is non-empty and appears in **`MAP_GROUP_ORDER[slug]`** (lint helps; spot-check new ids are in the order array).
- [ ] **`forms`**: all six keys present; lemmas match the **same sense** across languages (split `concept` if not).
- [ ] **`examples`**: all six keys, non-empty, **parallel meaning** (same bar as `forms`). No silent “English carries the sense” gaps in other languages.
- [ ] **`articles`**: **all six** language keys required with non-empty strings; appropriate determiner (or explicit neutral placeholder) per lemma. Do not leave gendered languages inconsistent without a note.
- [ ] **`tags`**: `false-friend-XX-YY` only with codes from the allowed set; spelling pairs that must not read as cognates are tagged; order of `XX-YY` does not matter.
- [ ] **`mirrorEveryday`**: patched rows still resolve to a real **`concept`** in `topicEverydayNouns100`; inherited `examples` are correct or explicitly overridden in the patch.
- [ ] **`corpusExamples`**: only language keys you intend; each list length **1–5**; anchor-language lines sane for frequency strip if used.
- [ ] **`cefrHint`**: if set, one of the allowed literals only (authoring-only).

## Cross-topic consistency

- [ ] No duplicate **`concept`** strings across the combined export surface from `words.ts` (lint enforces; note collisions when merging modules).
- [ ] **`difficulty`** and **`mapGroup`** choices feel coherent within the topic (harder or rarer items not accidentally first in Study unless intentional).
- [ ] Search / cognate behaviour: folding and false-friend handling remain aligned with data — see [`words-sky-topic-data.mdc`](../../rules/words-sky-topic-data.mdc) and `src/lib/latinFold.ts` / `crossLangLemmaAffinity.ts` when tags or forms change spelling similarity.

## Copy and tone (learner-facing strings inside data)

Example sentences are user-visible in Study. Follow [.cursor/skills/words-sky-language/SKILL.md](../words-sky-language/SKILL.md) and [`UX.md`](UX.md): short A1-friendly lines, no harsh negatives, no misleading cross-lingual pun when a `false-friend-*` tag applies.

## Optional editorial pass (not automated)

For doubtful lemmas: English spot-check via CEFRLex-style guidance in [.cursor/rules/words-sky-topic-data.mdc](../../rules/words-sky-topic-data.mdc) (*A1 level checks*).

## Deeper dives (do not duplicate here)

- Schema, tags, corpus pipeline: [.cursor/rules/words-sky-topic-data.mdc](../../rules/words-sky-topic-data.mdc)
- `examples` authoring: [.cursor/skills/words-sky-topic-examples/SKILL.md](../words-sky-topic-examples/SKILL.md)
- Map bands: [.cursor/skills/words-sky-map-layout/SKILL.md](../words-sky-map-layout/SKILL.md)

## Report template (for the user)

```markdown
## Topic cross-check
- lint:topic-data: pass/fail
- Vitest topic Study checklist (`topicWordIntegrity` / `words.test.ts`): pass/fail
- corpus:examples: skipped | pass/fail
- test/build/lint: …
- Topics spot-checked: …
- Cross-language issues: …
- Follow-ups: …
```
