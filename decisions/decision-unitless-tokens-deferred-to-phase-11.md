# Unitless tokens + platform adapters: deferred to Phase 11, not adopted now

- Status: accepted (deferral, not a rejection)
- Date: 2026-08-22
- Context: raised by the user immediately after decision-rem-for-typography-px-for-layout.md, citing Blade's real design decision on the same topic

## Context

Blade stores `fontSize`/`lineHeight`/`letterSpacing` tokens as bare numbers (`20`, not `"20px"` or `"1.25rem"`), with a small per-platform adapter function (`makeTypographySize.web.ts`, `makeTypographySize.native.ts`) converting to the right unit at the point of consumption. Their stated reason: a token layer shared across web and React Native can't bake in one unit, because the two platforms want fundamentally different things from the same logical value — web wants `rem` (`size / 16`), native wants a bare density-independent number with no unit conversion at all (`rem`/`px` don't exist as CSS concepts in React Native).

This isn't a pattern to evaluate on its own merits in the abstract — it only pays for itself once a second platform with different unit needs actually exists. Checked whether that's true for this project, not assumed: `LEARNING.md`'s Phase 2 Blade-comparison notes already name **Phase 11 (React Native parity)** as committed future scope, not speculative — "This is exactly the problem our own motion tokens will hit once a native output exists," recorded before this exact question came up. So Blade's reasoning does transfer here, directly, not by analogy.

## Decision

Defer adopting this pattern until Phase 11 actually starts, rather than adopting it now (Phase 5). Not a rejection of the pattern — an explicit statement that its cost should be paid when its benefit becomes real, not several phases early.

Reasoning: migrating `spacing`, `radius`, `borderWidth`, `focus.json`, `container.json`, and `typography.json`'s `fontSize` to bare numbers, plus writing the category-aware Style Dictionary transform that reattaches the correct unit per token category (`px` for layout, `rem` for type — matching decision-rem-for-typography-px-for-layout.md) at CSS-generation time, is real, non-trivial pipeline work. Doing it now means carrying that complexity through every phase between here and Phase 11 for a benefit — avoiding rework when a native platform shows up — that doesn't materialize until then. Migrating *at* Phase 11 costs the same as migrating now; nothing about the token values or the components consuming them gets cheaper or more expensive by waiting, since `Box`/`Stack`/`Inline`/`Container` (and later `Text`/`Heading`) only ever consume the generated `var(--ds-*)` custom property, never the token's stored value directly — whatever unit that custom property resolves to is invisible to every component built so far, and will still be invisible to whatever Style Dictionary transform ends up producing it.

## Consequences

- Token dimension values stay unit-strings (`"16px"`, `"1rem"`) exactly as decision-rem-for-typography-px-for-layout.md left them — no immediate follow-up work from this decision.
- When Phase 11 actually starts: convert every dimension token's `$value` to a bare number and `$type` from `"dimension"` to `"number"`, and add a custom Style Dictionary transform to the CSS platform that appends `px` or `rem` per category (mirroring the logic already decided for web) — plus whatever the native platform's own adapter needs, which doesn't exist yet and shouldn't be speculatively designed now.
- This decision itself is the thing to check first when Phase 11 planning starts — it already contains the "why" and the shape of the migration, so that work doesn't have to be re-derived from scratch.
