---
name: words-sky-pm-check
description: >-
  Product-manager readiness and UX compliance checks for Words Sky (A1 vocab
  app: Welcome, topic hub, Study, Map, localStorage progress). Use when the user asks for
  a PM review, ship checklist, UX audit, release gate, or "does this match the
  product spec" before merge or launch.
disable-model-invocation: true
---

# Words Sky — PM check skill

## Purpose

Run a **structured product review** against the in-repo rulebook and shipped behavior. Default outcome: a short **pass / pass-with-gaps / block** verdict plus prioritized gaps (P0 clarity, P1 polish, P2 nice-to-have). Depth lives in `references/` so this file stays scannable.

## When to use

- PM review, ship checklist, UX audit, release gate, or “does this match the product spec” before merge or launch.
- Scoped PR/branch reviews: still sanity-check global copy and core flow.

## Steps

1. **Read ground truth:** [`UX.md`](UX.md) (contradictions = bugs unless superseded); [`src/App.tsx`](src/App.tsx) routes (`/`, `/topics`, `/topic/:slug`); [`src/lib/progress.ts`](src/lib/progress.ts) (`WordStatus`, `wordssky.progress.v2`). For graph changes, also read [`.cursor/skills/words-sky-map-layout/SKILL.md`](../words-sky-map-layout/SKILL.md).
2. **Run the core flow gate** (below). If any item fails, treat as P0 unless clearly out of scope.
3. **Screen-through-smoke checklist:** open [references/pm-check-screen-checklist.md](references/pm-check-screen-checklist.md) and work Welcome → topic hub → Map → copy → interaction → state → scope flags → build order → engineering smoke.
4. **Copy-only work:** cross-check strings with [`.cursor/skills/words-sky-language/SKILL.md`](../words-sky-language/SKILL.md); the screen checklist still carries the UX copy table for full PM passes.
5. **Write the review** using [references/pm-check-output-template.md](references/pm-check-output-template.md) (verdict, P0/P1/P2, traceability, copy scan, when to deepen).

## Persona and session success (from UX.md)

- **A1 adult:** simple wording; no jargon or pedagogy overload.
- **2–5 minutes:** obvious next step; low cognitive load; no dead ends.
- **Phone or laptop:** touch targets and type readable; no tiny-only affordances.
- **Anchor language known:** selection + persistence; Study reflects anchor vs L2.

**Session success:** see word in known language → show translations → **Got it** / **Still learning** → next word, without confusion.

## Core flow gate

Canonical: **`Welcome → Topic hub → Topic → Study → (optional) Map → back to Study`**.

- [ ] Study is the **default** and primary destination after choosing a topic.
- [ ] Map is **optional** and never required to advance learning.
- [ ] Returning from Map does not lose place or contradict progress on the topic hub.

## Related skills

- **Map / React Flow:** [`.cursor/skills/words-sky-map-layout/SKILL.md`](../words-sky-map-layout/SKILL.md)
- **Copy / voice:** [`.cursor/skills/words-sky-language/SKILL.md`](../words-sky-language/SKILL.md)

If the user names a PR, branch, or feature: scope detailed findings to those files and flows while keeping the gates above.
