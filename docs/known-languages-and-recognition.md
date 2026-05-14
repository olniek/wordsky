# Languages you know & cross-language recognition

This document describes the **“Languages you know”** feature in Words Sky: what problem it solves, how it behaves in the product, how data is stored, and how the **recognition estimate** is computed from topic vocabulary.

It is aimed at engineers and anyone extending the A1 corpus, scoring rules, or UI around this flow.

---

## 1. Product intent

Many learners already speak one or more of the six app languages (EN, DE, PT, ES, FR, IT). When they pick a **target** language to study, a large share of **A1 vocabulary** may already be guessable from spelling or cognates—not from having “studied” the word in the app, but from **prior knowledge**.

The feature:

1. Lets the user declare which languages they **know** (orthogonal to the study-language anchor and translation-language toggles).
2. Uses that list to **estimate**, for each *other* language in the set, what percentage of the shared A1 corpus they might **recognise** without fresh study.
3. Surfaces that as a **landing strip** of cards and a **drill-down report** with buckets (Known / Easy / Learnable / New) and optional “bridge” forms.

Copy lives in `src/lib/strings.ts` under `strings.landing` (e.g. `knownLegend`, `knownHint`, `recognitionStripLabel`, `recognitionCardTitle`, and the recognition “how it works” popover keys `recognitionHowTrigger`, `recognitionHowBody1`, `recognitionHowBody2`, `recognitionHowClose`).

---

## 2. User-visible flow

### 2.1 Where to set “languages you know”

- **Welcome** (`WelcomeLanding` at `/`): the **Languages** panel includes `KnownLanguagesPicker` alongside anchor and translation language pickers (`AnchorPicker`, `TranslationLanguagePicker`, `KnownLanguagesPicker`). The same **`RecognitionHowPopover`** appears below the known-languages picker for the same short explanation.
- **Welcome** also mounts **`RecognitionStrip`** below the Languages card (before the primary CTA): when no known languages are selected, the empty state’s **Pick languages** control scrolls to `#welcome-lang-heading` instead of linking away; when at least one is selected, the strip matches the topic hub (cards, footnote, **How we estimate this**).
- The picker is a **fieldset** of chip buttons (role `checkbox`, `aria-checked`) for each `languageOrder` code, with a short hint explaining that the choice drives recognition estimates.

### 2.2 Topic hub and Welcome: recognition strip

- If **no** known languages are selected, `RecognitionStrip` shows an empty state. On **Welcome**, the CTA targets `#welcome-lang-heading` when `emptyCtaHash` is passed; on the **topic hub**, it links to **`/`** (Welcome) (`strings.landing.recognitionCardEmpty` and `strings.landing.recognitionCardEmptyCta`).
- If at least one language is known, the strip lists **every language that is not** in the known set as a **target**. For each target, it calls `summarize(target, knownLanguages)` and renders a **card** with:
  - Target language label
  - **Recognition percent** (rounded)
  - A progress bar
  - A short breakdown: counts for **Known**, **Easy**, and **Learnable** (`strings.landing.recognitionCardBreakdown`)
- Next to the footnote, **`RecognitionHowPopover`** (`src/components/recognition/RecognitionHowPopover.tsx`) offers a plain-language explanation of how the estimate is computed: hover shows the panel on fine pointers; tap / keyboard / **Close** cover touch and screen readers (see `strings.landing.recognitionHow*`).
- Each card links to `/recognize/:target` (e.g. `/recognize/ES`).

### 2.3 Report page

- Route: `RecognitionReport` at `/recognize/:target` (see `src/app/App.tsx`).
- Invalid `target` → redirect to topic hub (`/topics`).
- If known languages are empty → empty state with back link and the same hint as the strip.
- Otherwise: headline with percent, subtitle listing **known → target** and total **A1 word** count, a ring visualisation, **tablist** of four levels, and a **word list** (up to 100 per selected tab) showing target form, optional bridge from a known language, rule label, and numeric score. The same **`RecognitionHowPopover`** appears beside the disclaimer line as on the topic hub.

---

## 3. Persistence and React integration

### 3.1 Storage

- **Key:** `KNOWN_LANGS_KEY` = `'wordssky.knownLangs.v1'` in `src/lib/knownLanguages.ts`.
- **Value:** JSON array of language codes, written via `writeJSON` / read via `readJSON` from `src/lib/storage.ts` (localStorage with safe parse fallback).

### 3.2 Normalisation

`normalizeKnownLanguages(stored)`:

- Returns `[]` if `stored` is not an array.
- Keeps only values that are valid `LanguageCode`s (members of `languageOrder` from `src/data/words`).
- **Reorders** to the canonical `languageOrder` (stable product order, not insertion order).
- Invalid codes (e.g. typos, old data) are dropped.

### 3.3 `useKnownLanguages` hook

- Built on `useSyncExternalStore` with a tiny in-memory **listener set** so multiple components stay in sync when any writer updates storage.
- **SSR / no-window:** `getServerSnapshot` returns a fixed empty array serialised as JSON so hydration stays consistent.
- Setter: normalises, writes JSON, then notifies all subscribers.

This pattern avoids stale closure issues and matches how other persisted preferences might be wired.

---

## 4. Recognition pipeline (logic)

All scoring is **pure** and lives under `src/lib/recognition/`. UI components only call `summarize` and render results.

### 4.1 Corpus: `getA1Corpus()`

Defined in `src/lib/recognition/summarize.ts`:

- Walks every topic slug in `topicWords` (`src/data/words`).
- **Deduplicates by `concept`** (same concept can appear in multiple topic lists, e.g. overlap with `everyday-nouns`).
- Result is a single flat list of `TopicWord` rows—the **A1 recognition corpus** for this feature.
- Module-cached for performance; tests can call `_resetRecognitionCache()` when they swap fixture data.

### 4.2 Per-target summary: `summarize(target, known[])`

1. **Removes** `target` from `known` if present (`cleanKnown`), so you never “bridge” a language to itself.
2. Memoises by `(target, sorted known codes)` for the session (`Map` in module scope).
3. For each corpus row that has a **non-empty** `forms[target]`:
   - Calls `scoreWord(row, target, cleanKnown)`.
   - Buckets counts by `WordRecognition.level`.
4. Sorts all `WordRecognition` entries by **score descending**.
5. Computes `recognitionPercent` as the rounded percentage of words whose level is **known**, **easy**, or **learnable** (i.e. **not** `new`).

So “recognition %” is **optimistic coverage** of the corpus given declared known languages, not app progress.

### 4.3 Per-word score: `scoreWord` (`src/lib/recognition/score.ts`)

For each known language `k` (excluding the case where `k === target`, handled first):

- If the user marked **target** itself as known, every word in that language trivially scores as identical / known (the strip normally omits that language as a target card).
- Otherwise, compares `word.forms[target]` to `word.forms[k]` when both exist.
- **Multi-word lemmas** (e.g. phrases with spaces): `scoreTokens` splits on whitespace, scores each target token against the **best** known token, then **averages** scores; rule/metadata follow the strongest token match.

#### Pair scoring (`scoreAgainstForm`)

Order of checks (simplified):

| Stage | Effect |
|--------|--------|
| Same language | Identical score (100), rule `identical`. |
| `false-friend-X-Y` tag for the pair | Caps score at **49** (`FALSE_FRIEND_CAP`) when similarity would otherwise suggest easy recognition—safety net for misleading lookalikes. |
| `identicalAfterFold` | Uses `normalizeLemmaForCompare` from `crossLangLemmaAffinity` (Latin-fold style normalisation for search/compare). If fold-identical and not false-friend-capped → 100 / `identical`. |
| `cognate-X-Y` tag on the row | **95** (`COGNATE_TAG_SCORE`), rule `cognate-tag`, unless false friend → cap. |
| Short lemmas | If fold-normalised length **&lt; 4** on either side (after not being identical), fuzzy path returns **0** / `none`—avoids noisy matches on tiny strings. |
| Pattern + fuzzy | `applyPatterns` generates candidate spellings for language **pairs** (`patterns.ts`). `normalizedSimilarity` compares candidates. Pattern-fired strong matches can get a **+10** bonus capped at 100 when similarity ≥ 0.75. |
| `cognateByPattern` | If pattern transforms push similarity **≥ 0.9**, treated like a strong cognate (score derived from similarity + bonus, rule `pattern`), with false-friend cap. |
| Remaining | Best similarity → integer 0–100, rule `pattern` vs `fuzzy` vs `none`. |

The **best** score across all known languages `k` wins; `WordRecognition` records which language supplied the bridge (`matchedVia`), the known-side form (`matchedForm`), and `matchedRule`.

### 4.4 Levels: `levelForScore` (`src/lib/recognition/types.ts`)

Default buckets (score 0–100) use `LEVEL_THRESHOLDS`:

| Score range | Level |
|---------------|--------|
| ≥ 90 | `known` |
| ≥ 75 | `easy` |
| ≥ 50 | `learnable` |
| &lt; 50 | `new` |

For the winning bridge pair (`matchedVia` → target), `scoreWord` passes `LangPair` into `levelForScore` so optional **`PAIR_THRESHOLDS`** can tighten buckets for specific pairs (today: **EN↔PT** uses a lower `learnable` floor to reduce over-optimism). Unknown pairs use the defaults only.

These thresholds define the report tabs and the strip’s “Known / Easy / Learnable” counts.

### 4.5 Supporting modules

- **`cognates.ts`:** Regex for `cognate-XX-YY` tags; `isFalseFriend` delegates to `isFalseFriendPair` in `crossLangLemmaAffinity`; `identicalAfterFold`; `cognateByPattern` cross-checks pattern-expanded strings.
- **`patterns.ts`:** Small, conservative **per-direction** regex replace tables for specific `LangPair`s (e.g. EN→ES `-tion` → `-ción`, DE→ES borrowings, FR→PT). Undeclared pairs derive **reverse** rules when possible via `reverseRule`. `hasPatternsFor` exposes whether a pair has rules (for tests or future UI).
- **`crossLangLemmaAffinity.ts`:** Shared string normalisation and similarity used by Study/search and recognition.

### 4.6 Public API surface

`src/lib/recognition/index.ts` re-exports types, `levelForScore`, `LEVEL_THRESHOLDS`, `PAIR_THRESHOLDS`, `recognitionLevels`, `scoreWord`, `summarize`, `getA1Corpus`, pattern helpers, and cognate helpers—keep this stable if other features import recognition.

---

## 5. Tests

Vitest coverage includes:

- `src/lib/knownLanguages.test.ts` — normalisation and `loadKnownLanguages` with mocked storage.
- `src/lib/recognition/*.test.ts` — patterns, scoring edge cases, summarisation aggregates, `levelForScore` / pair thresholds.
- `src/data/words.test.ts` — topic registry, `getGuidedTopicWords` ordering, and **Study-ready** vocabulary rows via `collectTopicWordStudyDataIssues` (forms, `examples`, `articles`, `mapGroup`, speakable surface, optional `corpusExamples` bounds)—relevant when `topicWords` changes recognition’s corpus surface.

When changing `topicWords` shape, tags (`cognate-*`, `false-friend-*`), or scoring thresholds, extend or adjust these tests.

**Dev aid:** `npm run recognition:qa` runs `scripts/recognition-qa.ts`, which scans the corpus for unusually high `fuzzy` scores per target language (handy after editing patterns or tags).

---

## 6. Limitations and design notes

- **Estimates only:** Recognition is heuristic; it does not replace Study progress or spaced repetition.
- **A1 corpus bound:** Percentages are over **deduplicated topic words** that have a target form—not a full dictionary.
- **Declared knowledge:** If the user does not select a language they actually know, bridges and percentages shift accordingly.
- **False friends:** Tag-driven caps depend on topic rows carrying `false-friend-XX-YY` where curators need them (see `.cursor/rules/words-sky-topic-data.mdc`).
- **Performance:** Corpus is static at runtime; `summarize` memoises per `(target, known[])`. Prefer **profiling on real devices** before adding a Web Worker or offline precompute—both add complexity and bundle size and are not the default.
- **Report page (a11y):** Level filters are a single **`radiogroup`** with **`role="radio"`**, roving `tabIndex`, arrow/Home/End keys, and the word list in a **`role="region"`** linked via `aria-controls` / `aria-labelledby`—not a tablist/tabpanel pattern.

---

## 7. File map (quick reference)

| Area | Path |
|------|------|
| Persisted known languages + hook | `src/lib/knownLanguages.ts` |
| Chip picker UI | `src/components/recognition/KnownLanguagesPicker.tsx` |
| Welcome + language panel | `src/components/welcome/WelcomeLanding.tsx` |
| Welcome constellation (decorative) | `src/components/welcome/WelcomeConstellations.tsx` |
| Topic hub recognition strip | `src/components/recognition/RecognitionStrip.tsx` |
| Recognition “how it works” popover | `src/components/recognition/RecognitionHowPopover.tsx` |
| Report page | `src/components/recognition/RecognitionReport.tsx` |
| Routes | `src/app/App.tsx` |
| Copy | `src/lib/strings.ts` |
| Recognition QA (dev) | `npm run recognition:qa` → `scripts/recognition-qa.ts` |
| Scoring & summary | `src/lib/recognition/score.ts`, `summarize.ts`, `types.ts` |
| Patterns & cognate helpers | `src/lib/recognition/patterns.ts`, `cognates.ts` |
| Shared similarity / fold | `src/lib/crossLangLemmaAffinity.ts` |
| Styles | `src/index.css` (classes such as `known-lang-picker*`, `recognition-*`) |

---

## 8. Changelog discipline

If user-visible behaviour, copy, or storage keys change, update this doc and any other **minimum** docs called out in the project rules (e.g. `UX.md` if the landing flow is formally specified there). Bump `KNOWN_LANGS_KEY` only with a deliberate migration or compatibility note if old keys must coexist.
