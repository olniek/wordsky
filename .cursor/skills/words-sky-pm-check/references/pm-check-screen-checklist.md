# PM check — screen, copy, interaction, state, scope, build order, smoke

Use with [`.cursor/skills/words-sky-pm-check/SKILL.md`](../SKILL.md) after the core flow gate.

---

## Screen-by-screen PM checklist

### Welcome (`/`)

- [ ] **Wordsky** title + **2–3 line** intro explains what the app is and what to do next.
- [ ] **Languages** panel: anchor (I speak), translations for Study, known languages for recognition — all usable without hunting in a popover.
- [ ] One clear **primary CTA** to the topic list (`/topics`).
- [ ] Constellation art (if present) stays **decorative**; contrast remains readable.

### Topic hub (`/topics`)

- [ ] **Topic cards only** as the main grid (no competing language popover on this screen).
- [ ] Each card shows **learned / total** (or equivalent clear progress).
- [ ] **One CTA** per card, label matches state: **Start** (none), **Continue** (partial), **Review** (all learned).
- [ ] Copy is **short and practical**; every card answers “what is this?” and “what do I do?”.
- [ ] **Read-only** language summary + **Language setup** link back to Welcome when the learner wants to change languages.
- [ ] **Recognition strip** (above the topic grid): if no known languages, empty state points to Welcome; otherwise a **card per target** language (not in the known set) with percent, bar, breakdown, and link to **`/recognize/:target`**.
- [ ] **Recognition report** (`/recognize/:target`): invalid target redirects to the topic hub; no known languages → empty state with back link; tabs and word lists are keyboard- and screen-reader-friendly.
- [ ] **Find a word** (if present): hint explains multilingual + **accent-optional** matching; each hit shows **topic** and **`mapGroup`** so results stay tied to the scene the learner studies.

### Topic header (`/topic/:slug`)

- [ ] **One compact row**: back, topic name, **Study | Map** tabs, progress count.
- [ ] No long explanatory blocks in the header (move help to inline or `?` if needed).

### Study (primary)

- [ ] **One card, one word** at a time.
- [ ] **Before reveal:** only path forward is **Show translations** (no hidden gestures as sole path).
- [ ] **After reveal:** **Got it** is primary; **Still learning** is secondary.
- [ ] Next action is always an obvious **button**, not guesswork.
- [ ] No dependency on **graph interaction** to learn the word.
- [ ] **Anchor vs translations (layout):** anchor prompt + anchor-only example read as one phase; translation rows feel **consistent** across languages (language identity in tags and accents, not one language in a totally different “frame language” than the rest).
- [ ] **Readable secondary text:** example lines and meta hints (step, “up next”, optional shortcut line) are **legible**, not ultra-faint gray or italic-only for long sentences (see UX.md Study layout bullet).
- [ ] **Cognate vs caution:** translation rows may highlight same/similar spelling vs anchor; words tagged **`false-friend-L1-L2`** must use the **caution** treatment and short explanatory copy instead of “same spelling” emphasis (per UX.md).
- [ ] **Examples:** if shown on the anchor side, they match the **anchor language** only (no silent English example for another anchor).

### Map (secondary)

- [ ] Purpose reads as **progress / orientation**, not teaching.
- [ ] **Unseen** visually de-emphasized; **learned** clearly highlighted; **learning** distinguishable.
- [ ] **Grouping** matches learner-meaningful **`mapGroup`** bands; edges = **same concept across languages** only.
- [ ] Node tap opens the **same Study card** pattern (sheet/side) as Study mode; actions update progress without breaking Study queue expectations.
- [ ] Legend is **behind `?`**; no minimap by default (per UX + map-layout skill).

---

## Copy compliance (non-negotiable)

Approved vocabulary from **UX.md** — flag any UI string that diverges. Canonical wording for **new** copy is also in [`.cursor/skills/words-sky-language/SKILL.md`](../../words-sky-language/SKILL.md).

| Use | Do not use |
|-----|------------|
| Study | Learn |
| Map | Explore |
| Show translations | Reveal |
| Got it | Next (as the primary success label) |
| Still learning | Negative framing (“Wrong”, “Failed”, …) |
| Close | Lone `×` without accessible name (icon may stay **with** label) |

Global copy rule: **simple words only**. Each screen: (1) what is this? (2) what should I do now?

---

## Interaction and accessibility

- [ ] **One primary action** per screen state.
- [ ] Tap/click targets **≥ 44px** (or CSS equivalent that reliably hits this on mobile).
- [ ] **Motion** is subtle and purposeful (no gratuitous distraction in a 2–5 min session); decorative control motion honors **`prefers-reduced-motion`** where implemented (Study buttons / speak controls).
- [ ] **Keyboard** operable for main flows where applicable.
- [ ] **Screen reader:** buttons and tabs have clear names; when translations are shown, state changes are announced; focus order is logical.
- [ ] If a state could prompt “what do I do?”, there is **one short instruction line**.

---

## State and persistence (PM + risk)

- [ ] **localStorage** holds: anchor language, which languages appear in Study translations, **languages you already know** (recognition), current topic, last word index in topic, per-word status — and behavior matches user mental model when refreshing or revisiting.
- [ ] **No account** required; no surprise login walls.
- [ ] Call out **data loss** risks (private mode, clear site data, quota) in “known issues” if not mitigated in UI.

---

## Out of scope (red flags)

If a change introduces any of these **without an explicit product decision**, flag as **scope creep**:

- Accounts / login / social
- Streaks, XP, leaderboards
- Advanced graph editing (beyond map rules in the map-layout skill)
- Pronunciation scoring

**Principle:** ship **clarity** first.

---

## Build-order alignment (roadmap sense)

UX.md build order is a **priority ladder**, not a strict legal order — use it to judge whether work matches “foundation first”:

1. Anchor language selection + persistence  
2. Study two-state card clarity  
3. Progress model (`unseen | learning | known`)  
4. Topic hub progress + Start / Continue / Review  
5. Map visual states  

Note misalignment when **polish** ships before **core flow** is solid.

---

## Engineering smoke (light PM gate)

When the user cares about “ready to merge”:

- [ ] `npm run test` passes (progress, queue, anchor, **topic data**, **wordSearch**, **latinFold**, **crossLangLemmaAffinity**, **knownLanguages**, **recognition**, graph, …).
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes or gaps are acknowledged with owner.

Do not substitute this for full QA; use it as **regression signal**.
