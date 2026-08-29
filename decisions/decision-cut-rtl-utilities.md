# Cut RTL/dir utilities from Phase 5 scope

- Status: accepted
- Date: 2026-08-21
- Context: Phase 5 (Primitives) roadmap, Chunk 01 — resolves the open question raised in the roadmap's overview

## Context

`packages/utilities`' description (written in Phase 1, before the audience was locked) named RTL/dir helpers as in-scope. The audience locked since (project memory: India-focused, Hindi/Devanagari) is LTR — Devanagari reads left-to-right, same as Latin — so this scope predates the information that would justify it. The Phase 5 roadmap flagged this as a real open question rather than silently carrying the old scope forward or silently cutting it.

Investigated Blade (Razorpay's production design system, serving a comparable Indian market) for real evidence rather than deciding from architectural reasoning alone: zero logical-CSS-property usage (`margin-inline-start` etc.) anywhere in 245+ files that use physical properties (`marginLeft`/`marginRight`) instead, including in Blade's own base primitive; no `dir` field anywhere on their theme provider; no RFC or doc even discussing RTL or bidi text. Not "scoped but unfinished" — genuinely absent at every layer of a system that's been shipping in production.

## Decision

Cut RTL/dir utilities from Phase 5 (and from this project's near-term scope generally). No `useDir()` hook, no logical-property convention documented for primitives to follow.

This isn't "Blade doesn't do it so we won't either" — a reference system's omission alone wouldn't be sufficient justification, since Blade might simply have made the same premature-scoping mistake this project almost repeated. What actually resolves the question is that **this project's own confirmed audience doesn't need it**: Devanagari is LTR. Blade's evidence is corroborating (a comparable production system serving a comparable market reached the same conclusion at real scale), not the primary reason.

## Consequences

- `packages/utilities`' package.json description should be corrected to drop the RTL/dir mention — it no longer reflects real scope, and leaving it would mislead the next person reading it the same way it almost misled this decision.
- If a real RTL requirement shows up later (a script this product doesn't currently support), this is additive infrastructure, not a redesign — logical properties can be introduced primitive-by-primitive without breaking the existing LTR-only API surface.
- General note for future scope questions: three-phase-old scaffolding text is not binding scope, just a starting hypothesis — worth re-checking against whatever's actually been confirmed since, the same way this one was.
