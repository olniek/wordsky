# Ideas for review (draft)

**Status:** brainstorming and product direction — not committed scope.  
**Source of truth for shipped behavior:** [UX.md](../UX.md). If something here conflicts with UX.md, UX.md wins until you deliberately change it.

This document collects a **bigger-picture direction**, **possible features**, **how to strengthen the idea**, and **open decisions** so you can review or edit in one place.

---

## 1. Vision (bigger picture)

**Explore language through similarities** — not only “this lemma in six languages,” but how words **cluster**: by topic/scene, by form (cognates, families), and eventually by **usage** (what tends to appear together with a seed word).

- **Study** stays the grounded habit: short sessions, clear actions, low anxiety (see UX.md).
- **Exploration** becomes the intellectual spine: optional paths for curiosity — “what sits near this word?” across languages and on the map.

---

## 2. Feature directions (future / optional)

### 2.1 Word clouds (or calmer equivalents)

- **Idea:** On language rows or cards, show **neighbors** for a seed — e.g. “words most associated with *cat*” (definition TBD: co-occurrence in corpus, same `mapGroup`, collocations from authored examples, etc.).
- **UX caution:** Raw word clouds are dense and hard for accessibility; a **short ranked list** with “show more” may fit [UX.md](../UX.md) calm-readability goals better than a noisy cloud. Clouds could be a later polish if constrained (limits, static layout, strong contrast).

### 2.2 Map as exploration surface

- **Today (conceptual):** Map emphasizes progress and **same word across languages** (strands), plus `mapGroup` bands.
- **Direction:** Let learners **open a neighborhood** from a seed word or topic and see **links between different words** (not only cross-language alignment for one lemma).
- **UX caution:** Avoid global “hairball” graphs. Prefer **seed-scoped subgraphs**, filters, and a **legend** so every edge type is understandable.

### 2.3 Words connected to each other

- **Idea:** Graph edges express **why** two items relate: same topic, shared root, false-friend warning, co-occurrence, etc.
- **Trust:** Opaque “ML magic” links hurt an A1 trust brand; **labeled edge types** (and curated-first data) matter.

---

## 3. Is this a “strong” idea? (honest summary)

- **Strong as an angle:** Pattern-first vocabulary for **related languages**, with optional spatial exploration, is **more distinctive** than generic flashcards.
- **Not a moat by slogan alone:** The category is crowded; strength depends on **data quality**, **restraint in UI**, and proof that exploration improves **returning** or **outcomes**.
- **Dependencies:** “Words with *cat*” only feels authoritative with a clear **data story** (curated relations vs corpus statistics, licensing, QA).

---

## 4. How to improve the idea (themes)

1. **One wedge sentence** — internal and public — so every feature ladders to it (e.g. pattern-first A1 vocab across six languages; Study first, explore when curious).
2. **One similarity modality first** — pick one for v1 of exploration: topic/`mapGroup`, cognate family, or corpus co-occurrence. Mixing all three without labels feels like unexplained magic.
3. **Explicit jobs** — one line for the Study job-to-be-done; one line for the Explore job-to-be-done.
4. **Validation before heavy viz** — light metrics (e.g. exploration opened per session) plus a few user interviews so Map/cloud work does not outpace evidence.
5. **Curated-first ladder** — start with **authored** relations and existing tags (`false-friend-*`, topics); add corpus-backed clouds when pipeline and sourcing are solid **without** duplicating two conflicting truths between Study cards and Map.

---

## 5. Suggested phased shape (non-binding)

```text
Phase A — Study + one curated similarity modality (minimal or no new viz paradigm)
Phase B — Map: focused neighborhoods only, filters + legend, seed entry
Phase C — Language-card associates (ranked list and/or constrained cloud), same data contract as Map
```

---

## 6. Constraints (from current rulebook)

From [UX.md](../UX.md):

- **Study is primary;** Map is secondary and must not be required to learn.
- **Out of scope** unless product explicitly expands: accounts, streaks/XP, advanced **graph editing**, pronunciation scoring (§8).
- **Deferred:** full graded CEFR engine; see UX.md §9 and topic-data rules for planned tooling.

Exploration should stay **view-only** and optional unless you revise §8 deliberately.

---

## 7. Who might care (segments)

- Adults learning a **related** language (anchor + translations in the six-language set).
- Learners who dislike streak-heavy, high-pressure apps.
- Short-session mobile users (2–5 minutes).
- Smaller segment: polyglot-curious users who like **comparing** languages side by side.

**Less aligned:** learners whose primary goal is fluent speaking, deep grammar, or exam prep beyond A1 vocabulary without supplementary materials.

---

## 8. Open decisions (edit as you decide)

- [ ] Wedge sentence (final copy).
- [ ] First exploration modality: topic vs form vs corpus co-occurrence.
- [ ] List-first vs word cloud for v1 of “neighbors.”
- [ ] Data source for any usage-based cloud: in-app examples only vs external corpus (license, hygiene).
- [ ] Success metrics for exploration (quant + qual).

---

## 9. Related documents

- [UX.md](../UX.md) — flow, copy, scope, build order.
- [README.md](../README.md) — repo map and scripts.
- [docs/known-languages-and-recognition.md](known-languages-and-recognition.md) — recognition hints and persistence.
- [.cursor/rules/words-sky-topic-data.mdc](../.cursor/rules/words-sky-topic-data.mdc) — topic rows, tags, planned QA tasks.
