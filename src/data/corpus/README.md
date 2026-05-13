# Corpus-style example sentences (authoring)

## Strategy

- **`corpusExamples` on a topic row** holds one to five **extra** sentences per language **when that language key is present**. Any combination of languages is allowed; the Study UI shows them under **More detail** for each language in the learner’s current Study set (anchor plus chosen translations on Landing) that has a non-empty list, in that order. The optional frequency strip is built from the **anchor** language’s extra lines when that key exists.
- Sentences are **ranked and written offline** (or imported from a snapshot file), then **human-reviewed** for A1 fit and tone. The shipped app does **not** call external corpus APIs at runtime.
- The main parallel **`examples`** field stays the single primary sentence on the card; `corpusExamples` appear only under **More detail**.

## Sources and licensing

- Pipeline inputs should use **license-cleared** text only (e.g. [Tatoeba](https://tatoeba.org/) CC BY 2.0 FR, [OPUS](https://opus.nlpl.eu/) subsets with compatible licenses). Before merging a new bulk import, record **dataset name, version or date, and license** in the PR and keep this README aligned.
- Rows may carry optional authoring-only **`corpusMeta`** (`sourceId`, `licensedAs`) for audit trails.

## Pipeline

- Run `npm run corpus:examples` to validate every `corpusExamples` block in `topicWords` and to validate an optional JSON import file (see `scripts/corpus-examples.ts`).
