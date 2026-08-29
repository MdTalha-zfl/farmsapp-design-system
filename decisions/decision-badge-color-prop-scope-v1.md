# Badge v1: `color` prop (not `variant`), 3 feedback colors only

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Badge

## Context

Blade's real `Badge` has no `variant` prop at all — the shipped API is `color?: FeedbackColors | 'primary'`, where `FeedbackColors = 'information' | 'negative' | 'neutral' | 'notice' | 'positive'` (5 colors), plus a special-cased `primary` branch that reads from `surface.background/text/icon.primary.*` instead of `feedback.*`. Blade's own `_decisions/decisions.md` shows an older, non-Blade `@razorpay/components` library used `variant` with looser, non-semantic ambition — Blade deliberately renamed it to `color` and narrowed it to these 6 values.

This project's own `semantic-color.json` only defines 3 feedback colors — `success`, `warning`, `danger` — each with a solid (`feedback.<color>`, step 9) and subtle (`feedback.<color>-subtle`, step 3) value. There is no `neutral`, `information`, or `notice` feedback role. Checked directly, not assumed: `packages/tokens/tokens/color.json` defines exactly 5 primitive hue families — `brand`, `neutral`, `danger`, `warning`, `success` — no blue/info-like hue exists anywhere in the primitive layer either.

## Decision

**Ship `color: 'success' | 'warning' | 'danger'`, required, no default.** Named after this project's own existing semantic roles (matching `feedback.success/warning/danger`), not ported literally from Blade's `positive/negative/notice` vocabulary — this project already has its own naming convention for these same 3 states and Badge should speak it, not Blade's.

No default value: every one of these 3 colors carries real status meaning, so silently defaulting to one of them would misrepresent state for a caller who forgot to pass it. This is a deliberate omission, not an oversight — revisit only if a genuine "neutral/informational" use case shows up (see below).

**`primary` branch: deferred**, same rationale as `decisions/decision-button-variant-color-scope-v1.md`'s deferred `color` prop — no real consumer yet, and reusing brand color for a badge would need new subtle-brand semantic pointers (e.g. a `brand`-flavored subtle background) that don't exist in `semantic-color.json` today, only bare primitive `color.brand.*` steps.

**`neutral`/`information`/`notice`: deferred, and more fundamentally blocked than the `primary` deferral above** — this isn't just "no consumer yet," there is no primitive hue to point at. Adding it means inventing an entirely new primitive color family (a 12-step blue/gray scale, new dark-mode values, new contrast verification), not just wiring a new semantic pointer onto an existing scale. Flag this distinction explicitly so it isn't mistaken for the same size of change as the `primary` deferral.

## Consequences

- `BadgeColor` is a closed 3-value union today; adding `primary` later is additive (new semantic tokens + one new branch in the color-resolution logic, no restructuring). Adding `neutral`/`information`/`notice` is a bigger lift — a new primitive hue family first — and should be scoped as such if it ever comes up, not estimated as "just another color."
- Every real Badge use case in this project today must map onto success/warning/danger; anything that would want a gray/neutral badge (e.g. "draft", "archived") has no home yet and should surface as a real, cited need before tokens get invented for it.
