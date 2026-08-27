# VisuallyHidden — minimal scope, matching Blade's real shape exactly

- Status: accepted
- Date: 2026-08-27
- Context: Phase 5 Primitives roadmap (`VisuallyHidden` was named there, deferred, then pulled back in as a Phase 7 prerequisite chunk alongside `Icon` — see the Phase 7 Prerequisites plan)

## Context

A real trace of Blade's `VisuallyHidden` (their actual source, not guessed) confirmed two things worth stating explicitly before building this project's own version:

1. **It has zero id-generation logic of its own.** Props are only `children` (required) and `testID`. Any pattern that needs a stable id to link a visually-hidden label to a control (`aria-labelledby`) generates that id in the *consuming* component (Blade's own example: `ChipGroup` calls its own `useId()` and wires the result through both a visible `<FormLabel>` and a `<VisuallyHidden>` block). This directly corrects an assumption already sitting in this project's own `LEARNING.md` ("`VisuallyHidden` and any accessibility-conscious primitive needs stable, unique DOM ids from the moment it exists") — the id need is real, but it belongs to future consumers, not to `VisuallyHidden` itself.
2. **It is not used for icon-only-button accessible names.** Blade's own `IconButton` uses a required `accessibilityLabel` prop mapped directly to `aria-label` — the icon stays `aria-hidden`, the *button* carries the name. `VisuallyHidden` is reserved for a different shape of problem (a visible label plus a separately-worded hidden one; skip-links; live-announcer regions), none of which this project's nearest-term consumer (`Button`/`IconButton`) actually needs.

## Decision

Match Blade's real, confirmed shape exactly:

```tsx
export interface VisuallyHiddenProps {
  children: ReactNode;
}
```

**No `as` prop.** Blade's own version doesn't have one either, and there's no current consumer need for a block-level variant — adding one now would be exactly the "speculative public surface" pattern this project has consistently avoided elsewhere (`textDecorationLine`'s `"dotted"` handling, `wordBreak`'s closed union, the base-reset's deliberately minimal scope). Renders as a fixed `<span>`.

**No id logic.** Confirmed above — stays a pure styling wrapper. `ref` is forwarded (not part of Blade's own prop list, but cheap and consistent with every other primitive here forwarding one).

**No focus-reveal ("skip link") variant.** Blade handles that with a structurally separate component (`SkipNav`) that imports the same raw CSS technique and layers its own `:focus` override — not a `VisuallyHidden` prop or mode. If this project ever needs a skip-link, it gets its own component later, for the identical reason.

**The CSS technique lives in `base.css`, not the component file** — a new `.ds-visually-hidden` class inside the existing `@layer base` block, the canonical WebAIM "invisible content" recipe Blade itself cites and uses (`clip`+`clip-path` set together for legacy/modern browser coverage; `overflow: hidden` + a 1px box pushed off-screen via `left: -10000px`, never `display: none`/`visibility: hidden`, both of which would also remove the content from the accessibility tree — the opposite of the goal). This matches `base.css`'s own established reasoning for what belongs there: small, fixed, non-prop-scale-driven CSS. Ships automatically to every consumer that already loads `@farmsapp/design-system/css` — no new CSS import needed, unlike `Icon` (a separate package, needing its own `icon.css` import).

## Consequences

- `packages/design-system/src/components/VisuallyHidden/VisuallyHidden.tsx` — new file, exported from `index.tsx`.
- `base.css` gains one new fixed rule; verified in a real browser that every declared property computes exactly as written, that the text content survives in the DOM (not removed the way `display: none` would), and that a real accessible-name check (via a plain native `<button>` wrapper — not the not-yet-built `Button` primitive) confirms the technique actually works, not just looks right on paper.
- No id-generation dependency — `useId` (built in Utilities Chunk 01, originally justified partly by this exact component) stays unused by `VisuallyHidden` itself; it remains available for whatever future component needs the `aria-labelledby` pattern Blade's `ChipGroup` demonstrates.
