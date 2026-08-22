# Box must resolve style props to CSS custom properties, never literal values

- Status: accepted (constraint, not yet implemented — binds Chunk 02)
- Date: 2026-08-21
- Context: Phase 5 (Primitives) roadmap, Chunk 02 planning, informed by comparing Blade's Box implementation

## Context

Investigated Blade's `BaseBox` (the styled-components primitive every component is built on) for its style-prop resolution mechanism. Confirmed by reading the actual source: a prop like `padding="spacing.4"` resolves via `getIn(theme, 'spacing.4')`, and color props resolve via `getIn(theme, 'colors.surface...')` — both bottom out in plain JS strings (e.g. a literal `hsla(0, 0%, 97%, ...)`) computed once from the theme object and injected by styled-components into a runtime `<style>` tag. There is no CSS custom property anywhere in that path.

This works for Blade because their theme/brand switching is JS-Context-driven — confirmed in an earlier comparison (Phase 4 planning): Blade's React provider rebuilds the entire theme object on every render with no memoization, and switching theme/brand means React re-rendering the whole subscribed tree with new literal values.

This project made the opposite bet in Phase 4: zero re-render theming. `ThemeProvider` sets a `data-theme`/`data-brand` attribute; every themed value is a `var(--ds-*)` reference; the cascade (not React) does the work of resolving to the right value. Nothing re-renders for a theme or brand change — proven live in Theme Runtime Chunks 04 and 05.

## The risk this decision heads off

If `Box` (Phase 5 Chunk 02) resolved `padding`/`backgroundColor`/etc. props to literal values the way Blade's does — even if those literals are *read from* the token system at build or resolve time — every brand override and every dark-mode value built in Phase 4 would silently stop applying to anything styled through `Box`. The override only works by redefining a custom property that something else references via `var()`; a component that already resolved to a literal value has no reference left for the cascade to intercept. This is exactly the TS-vs-CSS-vars hard rule from Phase 4, applied to the first real component that could violate it.

## Decision

`Box`'s style-prop resolution must always emit `var(--ds-*)` references for anything token-backed (spacing, color, radius, shadow, etc.), never a resolved literal — regardless of which performance approach (runtime inline styles vs. compiled CSS classes) Chunk 02 ends up choosing for the resolution mechanism itself. The two questions are independent: *how* styles get computed (runtime vs. build-time) doesn't determine *what* they resolve to (a var() reference vs. a literal) — get the second one wrong and it doesn't matter how fast the first one is.

## Consequences

- Chunk 02's implementation and its own tests/verification need an explicit check for this: pick a Box instance, confirm its computed style references `var(--ds-*)`, not a literal, the same category of check Theme Runtime already established (reading real computed output, not trusting source code alone).
- This constraint is unrelated to, and should not be conflated with, the Box performance decision (`decisions/` entry to be written when Chunk 02 actually resolves it) — noted here specifically so the two don't get merged into one decision and the constraint doesn't get silently dropped for being "obviously implied" by the performance choice.
