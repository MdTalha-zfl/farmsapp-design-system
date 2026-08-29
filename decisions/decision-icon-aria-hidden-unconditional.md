# Icons are always `aria-hidden`, no opt-out — accessible naming is the consuming component's job

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon, following a real trace of Blade's Icon/IconButton accessibility model

## Context

Blade's real `Icon` bakes `aria-hidden="true"` unconditionally into its shared internal `Svg` primitive — no prop exists to turn it off. Blade's `IconButton` doesn't compensate with `VisuallyHidden`; it uses a required `accessibilityLabel` prop mapped directly to `aria-label` on the interactive element itself. The icon stays invisible to assistive tech; the *button* carries the name. Confirmed directly from Blade's real source, not inferred.

## Decision

**Match this exactly.** Every generated icon's wrapper component hardcodes `aria-hidden="true"` in its JSX — not part of `IconOwnProps`, no opt-out prop exists at all. The wrapper spreads `{...rest}` *before* the fixed `aria-hidden="true"` in JSX source order, so JSX's own last-attribute-wins rule makes the hardcoded value win even against a non-TypeScript caller's type-bypassed override attempt.

**Accessible naming for icon-only interactive elements is explicitly deferred, not resolved here.** This plan is scoped to `Icon`/`VisuallyHidden` only — whatever `Button`/`IconButton` end up needing (a required `aria-label`-style prop, matching Blade's real, simpler choice, rather than `VisuallyHidden` + `aria-labelledby`) is a decision for whenever that component is actually planned, with real requirements in hand.

## Consequences

- Verified in a real browser: all 19 rendered `<svg>` elements in the gallery report `aria-hidden="true"` — zero icons are ever accessible-name-bearing on their own.
- No accessibility regression risk from a consumer accidentally leaving an icon unlabeled *and* exposed to screen readers — the icon is never exposed, so the failure mode is "no name at all" (a real gap to catch when `Button` is built), never "a meaningless name read aloud" (Blade's own icons render children like raw path data, which would be actively wrong to expose).
