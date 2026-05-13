---
name: words-sky-language
description: >-
  UI copy, tone, and terminology for Words Sky (A1 vocab, 2–5 min sessions).
  Use when writing or reviewing user-facing strings, buttons, errors, empty
  states, aria labels, onboarding hints, or when the user asks for wording,
  voice, microcopy, or "what should this say?".
disable-model-invocation: true
---

# Words Sky — language and copy

## Purpose

Keep **every user-visible string** aligned with [`UX.md`](UX.md): adult A1 learner, simple English, no shame, obvious next step. This file holds the **canonical approved-terms table** for authors. Full flow and ship gates: [`../words-sky-pm-check/SKILL.md`](../words-sky-pm-check/SKILL.md) (PM checks the same terms against shipped UI via [`../words-sky-pm-check/references/pm-check-screen-checklist.md`](../words-sky-pm-check/references/pm-check-screen-checklist.md)).

## Steps (when writing or reviewing copy)

1. Read [`UX.md`](UX.md) sections 1 and 3–4; skim existing strings in the same `src/` area for length, tone, and casing.
2. **Search** changed UI for forbidden tokens (`Learn`, `Explore`, `Reveal`, primary **`Next`** after reveal, harsh negatives); enforce **Approved terms** below.
3. Apply **Voice** and **Microcopy patterns**; for Study rows, follow **Study — translation rows** and [`src/lib/strings.ts`](src/lib/strings.ts) keys you touch.
4. Match **`aria-label` / visible copy** intent (**Accessibility strings**); no “Reveal” in names if the button says **Show translations**.

## Ground truth

1. **[`UX.md`](UX.md)** sections 3–4 (screens + copy rules) and section 1 (user + session goal).
2. Existing UI in `src/` for consistency of patterns (length, sentence case, where hints sit).

If UX.md and shipped copy disagree, **UX.md wins** unless there is a documented product decision.

---

## Voice

- **Short and practical.** Prefer labels and short phrases over paragraphs.
- **Plain words only** — no pedagogy jargon, no clever idioms, no “gamified” hype.
- **Encouraging, not evaluative.** Progress is neutral; avoid blame (“wrong”, “failed”).
- **Every screen answers:** (1) What is this? (2) What should I do now?
- **Session mental model:** see word in a **known (anchor) language** → show other translations → **Got it** or **Still learning** → clear path to the next word.

---

## Approved terms (use exactly these in UI)

| Use | Do not use |
|-----|------------|
| Study | Learn |
| Map | Explore |
| Show translations | Reveal |
| Got it | Next (as the **primary** success action after translations are shown) |
| Still learning | Negative framing (“Wrong”, “Failed”, “Incorrect”, …) |
| Close | A lone × or icon with no accessible name; if there is a visible label, use **Close** (icon may accompany the label) |

**Landing CTAs (one per topic card):** **Start** (no progress), **Continue** (in progress), **Review** (all learned).

**Topic shell:** mode tabs **Study** and **Map**; keep the header row compact (UX.md).

---

## Domain words (use consistently)

- **Anchor language** — the language the learner already knows well; base for showing the word first where the flow requires it.
- **Topic** — a themed word set (card on Landing).
- **Learned / total** — progress on Landing cards (or equivalent clear counts).
- **Map** — optional visual progress; not the primary teaching surface.
- **Find a word** — landing search across all languages; matches are **accent-insensitive** (and treat German **ß** like **ss** for typing). Hit lines show **topic title** and **`mapGroup`** (scene band within the topic). Hint copy lives in [`strings.landing`](src/lib/strings.ts) (`wordSearchHint`, `wordSearchPlaceholder`, …).

Avoid introducing alternate branded names for the same thing (e.g. do not mix “Deck” and “Topic”).

---

## Microcopy patterns

- **Buttons:** action-first, sentence case unless the product already uses title case in that component — **match the file you edit**.
- **Hints:** one line, imperative or short question only when it removes “what do I do?” confusion.
- **Empty / edge states:** say what happened in plain language and give **one** next action (button or link), not a lecture.
- **Errors (network, storage):** no stack traces; suggest retry or check connection; avoid blaming the user.

### Study — translation rows

- After **Show translations**, some rows get visual emphasis when lemmas **match or almost match** the anchor (helpful for EU cognates). Do not rename that pattern to “correct” or “verified”.
- When topic data includes **`false-friend-XX-YY`**, Study shows a **caution** row treatment plus one short line (`strings.topic.falseFriendHint` in [`src/lib/strings.ts`](src/lib/strings.ts)). Keep that sentence calm and factual; change wording only with UX.md alignment (no shame, no jargon).
- The **anchor** example sentence (when `examples` exist) is shown **only in the anchor language** — there is no fallback to English in another language’s slot.
- **Coordination with layout:** Example lines are **supporting** copy (shorter and calmer than the headword). Do not add learner-visible jargon labels such as “cognate” or “false friend” beyond the existing caution string unless UX.md explicitly expands copy. Contrast and hierarchy are shared with CSS ([`src/index.css`](src/index.css) `study-*`); if you add new Study hints, keep them one line and check readability on a small phone.

---

## Accessibility strings

- `aria-label` / accessible names must match the **same intent** as visible copy; do not use forbidden synonyms in names only (e.g. do not use “Reveal” in aria while the visible label says “Show translations” — align both to **Show translations**).
- **Close** controls: provide a proper accessible name (not only “×”).

---

## Characters and formatting

- Do not use **§** in user-facing text (poor rendering in many contexts).
- Avoid decorative Unicode in production UI unless the design system already uses it.

---

## Out-of-scope vocabulary (UX.md section 8)

Do not introduce user-facing promises for **accounts**, **streaks / XP / leaderboards**, **advanced graph editing**, or **pronunciation scoring** unless product explicitly decides to ship that scope.

---

## Examples

**Study — after translations**

- Good primary: **Got it**  
- Good secondary: **Still learning**  
- Avoid: **Next** as the main success label; avoid **Mastered** / **Easy** if they imply judgment.

**Map**

- Good: framing as orientation / progress (“where you are in this topic”).  
- Avoid: copy that implies you **must** use the graph to learn the word.

**Instruction line**

- Good: “Choose a topic to start.”  
- Avoid: multi-sentence onboarding blocks in the topic header (per UX.md).

---

## When to escalate

- New **language learning** (i18n) or **locale** strategy — this skill assumes English UI for now; coordinate strings and keys with whoever owns i18n.
- **Legal / privacy** copy — not covered here; use dedicated requirements.

End state: new strings read like the rest of Words Sky — calm, simple, and actionable for a short session.
