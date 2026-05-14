# Words Sky UX (Simple Version)

This is the product rulebook in plain language.

If something is confusing, remove it.

---

## 1) User and Goal

### User
- Adult A1 learner
- 2 to 5 minutes per session
- Uses phone or laptop
- Knows one language well (anchor language)

### Session goal
Learn one word quickly:
1. See the word in a known language
2. Show translations
3. Mark `Got it` or `Still learning` **for each language row** (anchor and each translation you chose in **language setup** on Welcome)
4. Tap `Continue` to move to the next word

---

## 2) One Core Flow

Use this flow everywhere:

`Welcome (language setup) -> Topic hub -> Topic -> Study -> (optional) Map -> back to Study`

Study is the default and main screen.
Map is secondary and optional.

Topic hub lists topics and **Find a word**; Welcome is where you pick anchor, translation, and known languages.

---

## 3) Screen Rules

### Welcome (language setup)

- First screen: product name **Wordsky**, a **2–3 line** plain-language intro, then **Languages** in one panel: **anchor** (I speak), **translation languages** for Study, and **languages you already know** (for recognition hints). Primary CTA continues to the **topic hub** (`/topics`). Optional slim top bar may repeat the name and link **Topic hub** for wayfinding.
- A small **“How we estimate this”** control (same as on the topic hub and recognition report) sits with the known-languages block and opens a short plain-language explanation without leaving the page.
- Optional calm **constellation** decoration (readable contrast); optional very slow glow pulse unless **`prefers-reduced-motion`**; must not be required to use the form.
- Keyboard-friendly controls; chip rows follow the same focus patterns as the rest of the app.

### Topic hub

- Above the grid: short hero (topic list title + subtitle), a **read-only** line summarising the current language setup (e.g. `English · 4 languages`) with a **Language setup** link back to Welcome; plus **Find a word** search.
- Main area: **topic cards** with progress and a single CTA each
- Show progress on each card: `learned / total` (**total** counts each word once per visible study language — anchor plus each chosen translation — not just once per topic row)
- Show one action per card:
  - `Start` (no progress)
  - `Continue` (in progress)
  - `Review` (all learned)
- Keep copy short and practical
- **Find a word** matches across languages with **accents optional** (folding is shared with lemma comparison). Each hit shows the **topic title** and the word’s **`mapGroup`** label (subgroup within the topic) so lookup stays tied to the scene you study.
- Optional **recognition** strip: percents are **rough estimates** from A1 topic vocabulary and the languages you marked as known—not a fluency score. A **“How we estimate this”** control next to the footnote opens the same short explanation as on Welcome and the recognition report (hover on desktop; tap, **Close**, or keyboard elsewhere).

### Topic Header
- Keep one compact row:
  - back
  - topic name
  - mode tabs (`Study`, `Map`)
  - progress count
- No long text blocks in the header

### Study (Primary)
- One card, one word
- Two clear states:
  - **Before translations are shown**: only `Show translations`
  - **After translations are shown**: each **language row** (anchor and each translation) shows the word in that language. Each row has `Got it` (primary) and `Still learning` (secondary) for **that language only**. When every row has been marked, a single `Continue` control moves to the next word
- Always show the next action as a clear button
- Do not require graph interaction to learn
- **Layout and readability:** Keep the **anchor** prompt (and anchor-only example sentence) in one grouped block. After reveal, **translation** rows share a calm, consistent frame; use **language color as an accent** (for example along one edge plus the language tag), not a one-off heavy border treatment that makes one language look like a different screen. **Example sentences** stay visually secondary but **readable** (contrast and line spacing matter; do not rely on faint gray italic alone for long lines). **Meta lines** (step, optional keyboard hint on fine pointers, “up next”) stay short and legible, not whisper-quiet.
- After translations are shown, some rows may be highlighted when the spelling matches or almost matches the anchor (helpful cognates). If topic data includes a `false-friend-L1-L2` tag for that pair, the row uses a **caution** treatment and a short line of copy instead of the “same spelling” highlight, so learners are not nudged toward the wrong meaning.
- Topic rows ship a **primary example sentence** per language in data; the line under the anchor word is shown **only in the anchor language** (parallel sentences appear on each translation row after reveal).
- Optional **More detail**: when a row includes **`corpusExamples`** for any language in your current Study set (anchor plus translation languages from **language setup**), you can open short lists of extra example sentences per language that has them, in the same order as Study. A small word-frequency strip is built from the **anchor** language’s extra lines only when that language has a list. It is optional reading and does not change how you mark `Got it` / `Still learning`.

### Map (Secondary)
- Purpose: visual progress, not teaching
- Dim unseen words
- Highlight learned words
- Words are grouped on the canvas by **`mapGroup`** (e.g. farm animals together, pets together, rodents such as mouse and rat in their own band—not mixed with pets; family core vs extended). Each band shows a faint **band heading** (humanized `mapGroup` id) at its top edge so the structure is readable without reading words. Lines only connect **the same word across languages**; each line is **tinted by the target language** so a learner can map a strand back to a satellite
- A **band chip strip** sits under the topic header (Map mode only). Each chip is a `mapGroup` with a small `learned / total` counter; tapping a chip animates the viewport to that band. The strip stays calm and out of the way — no minimap
- The Map shows the **same language subset** as Study: your anchor plus the translation languages you chose in **language setup** (not every language in the topic)
- Tapping a node opens the **same Study card** as in Study mode (sheet on the side) **and** dims other clusters/lines for the moment, so the focused cluster reads as a single unit. Tapping the empty canvas clears the sheet and the dim. `Got it` / `Still learning` on the sheet apply **only to the language of the node you tapped**. Close the sheet when you are done; your Study step in the topic does not change
- On phones the Map sheet rises as a **bottom sheet** rather than a side panel, so the band strip and clusters remain visible above it
- Keep legend hidden behind `?` (no minimap by default)

---

## 4) Copy Rules (Very Important)

Use simple words only.

- Use `Study`, not `Learn`
- Use `Map`, not `Explore`
- Use `Show translations`, not `Reveal`
- Use `Got it`, not `Next`
- Use `Still learning`, not negative wording
- Use `Close`, not `x` alone (icon can stay with label)

Every screen must answer:
1. What is this?
2. What should I do now?

---

## 5) Interaction Rules

- One primary action per screen state
- Buttons and taps must be at least 44px
- Keep motion subtle and meaningful; respect **`prefers-reduced-motion`** for decorative feedback (for example press-in on buttons) so core flow stays comfortable
- Keep keyboard and screen-reader support
- If user might ask “What do I do?”, add one instruction line

---

## 6) State and Persistence

Persist in `localStorage`:
- anchor language
- which languages appear in Study translations (subset of non-anchor, or all)
- **languages you already know** (declared on Welcome; drives recognition estimates on the topic hub and optional report)
- current topic
- last word index in topic
- per-word **per language** status: `unseen | learning | known` (each anchor and translation surface is tracked separately)

No account required.

---

## 7) Build Order

1. Anchor language selection + persistence
2. Study screen clarity (two-state card with explicit actions)
3. Progress model (`unseen | learning | known`)
4. Topic hub progress and CTA text (`Start/Continue/Review`)
5. Map visual states (dim/known/learning)

---

## 8) Out of Scope

Do not build now:
- accounts/login/social
- streaks, XP, leaderboards
- advanced graph editing
- pronunciation scoring

Ship clarity first.

---

## 9) Deferred: graded vocabulary (CEFRLex direction)

We target **A1** with curated topics, not an automated CEFR engine. Optional **manual** checks (e.g. CEFRLex demo for English) and a **later** roadmap of scripts, optional metadata, and cross-language QA live in [.cursor/rules/words-sky-topic-data.mdc](.cursor/rules/words-sky-topic-data.mdc) under **A1 level checks** and **Planned tasks**. Readability highlighters and similar tools stay here until a deliberate “in scope” call.

---

## 10) Related (contributors)

- [README.md](README.md) — scripts and where key modules live.
- **Known languages** persistence, recognition scoring, and routes: [docs/known-languages-and-recognition.md](docs/known-languages-and-recognition.md).
- Topic row schema, `tags`, data tests, and CEFR-style **planned tasks**: [.cursor/rules/words-sky-topic-data.mdc](.cursor/rules/words-sky-topic-data.mdc).
