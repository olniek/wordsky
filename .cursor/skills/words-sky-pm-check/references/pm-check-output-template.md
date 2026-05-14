# PM check — output shape, severity, copy scan, deepening

Use after checklists in [pm-check-screen-checklist.md](pm-check-screen-checklist.md).

---

## Output template

Deliver findings in this shape (adapt depth to request):

```markdown
# Words Sky PM check — [scope: e.g. branch name / feature]

## Verdict
**Pass** | **Pass with gaps** | **Block** — one sentence why.

## Executive summary
2–4 sentences for a busy reviewer.

## P0 (ship blockers — clarity, wrong flow, spec violation)
- …

## P1 (should fix soon — copy, a11y, misleading progress)
- …

## P2 (nice to have)
- …

## Scope / strategy notes
- Out-of-scope risks, roadmap fit, or decisions needed.

## Traceability
- UX.md sections: …
- Files touched (if known): …
```

### Severity guidance

- **Block:** breaks core flow, violates UX.md on primary teaching path, inaccessible primary action, or ships forbidden scope.
- **P1:** violates copy table, confusing progress, Map misleading vs Study, a11y gaps on main path.
- **P2:** visual polish, edge-case copy, non-primary surfaces.

---

## Quick pre-ship copy scan

Search UI for forbidden terms and legacy labels (adjust for i18n if added later):

- `Learn`, `Explore`, `Reveal`, `Next` (as primary CTA after reveal), negative status words, bare `aria-label` that says only “close” without matching **Close** pattern where UX requires label text.

---

## When to deepen the review

- **Onboarding / first run:** walk anchor language selection cold.
- **Return visit:** refresh mid-topic; confirm Continue and index behavior.
- **Review mode:** all known — confirm Review loop feels intentional, not empty.
- **Map + Study together:** progress changes in Map reflect immediately on the topic hub and Study queue.

End state: the team can act on **ordered, spec-traced** feedback without re-deriving product intent from chat history.
