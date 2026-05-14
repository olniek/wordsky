# Words Sky — topic `examples` (sentence lines)

Use when adding or editing `TopicWord` rows in [`src/data/words.ts`](src/data/words.ts) or [`src/data/topicEverydayNouns100.ts`](src/data/topicEverydayNouns100.ts).

## Rules

- **`examples` is required** on every `TopicWord`: all six languages `EN`, `DE`, `PT`, `ES`, `FR`, `IT` with non-empty strings. Same **meaning** in each line (parallel translations), like `forms`.
- Keep sentences **short and A1-friendly**: simple present, concrete situation, natural use of the target lemma.
- Respect product copy: no harsh negative framing in learner-facing lines (see [UX.md](UX.md) and [.cursor/skills/words-sky-language/SKILL.md](../words-sky-language/SKILL.md)).
- If a row has **`false-friend-XX-YY`**, do not rely on misleading cross-language similarity in the example wording; keep sense clear for the anchor learner.
- **`mirrorEveryday(concept, patch)`** inherits `examples` from the everyday source row unless you override `examples` in `patch`. Prefer adding or editing examples **once** on the source concept in `topicEverydayNouns100.ts` when mirrors should share the same line.

## Validation

After edits: `npm run lint:topic-data` (structural checks including `examples`), then `npm run test` and `npm run build` per project rules. Tests aggregate a **Study + listen** row checklist via [`collectTopicWordStudyDataIssues`](src/data/topicWordIntegrity.ts) in [`src/data/words.test.ts`](src/data/words.test.ts) (all six `examples`, `articles`, non-empty speakable `forms` surface, `mapGroup`, optional `corpusExamples` shape).

## See also

- Full schema and tags: [.cursor/rules/words-sky-topic-data.mdc](../../rules/words-sky-topic-data.mdc)
- All-topic QA order: [.cursor/skills/words-sky-topic-cross-check/SKILL.md](../words-sky-topic-cross-check/SKILL.md)
- Map bands: [.cursor/skills/words-sky-map-layout/SKILL.md](../words-sky-map-layout/SKILL.md)
