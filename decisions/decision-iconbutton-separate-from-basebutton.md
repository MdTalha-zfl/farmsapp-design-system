# IconButton is genuinely separate from BaseButton — matching Blade exactly

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — IconButton

## Context

Confirmed directly from Blade's real source and explanation (pasted this session): `IconButton` is not "`Button` with an icon and no text" — `Button`'s own icon-only mode already covers that case (a bordered/filled square button). `IconButton` solves a different problem: a bare clickable icon with a transparent background, for a table row, a card corner, a modal close (X), an AppBar. Blade's own real JSDoc states the line explicitly: *"Component for making clickable icons with transparent background. For other cases please use Button component with icon prop."*

Blade's real `IconButton.tsx` imports `StyledIconButton` directly and never touches `BaseButton` — a completely different color model (`emphasis`/`isHighlighted` vs. `variant`×`color`), different default shape (unboxed by default vs. bordered/filled), different size scale (3 steps, no `xsmall`, vs. `Button`'s 4), and a hardcoded `type="button"` safety default `Button` doesn't share (`Button` respects a real `type` prop; `IconButton` is so often dropped into forms as a close/delete/edit action that Blade forces this rather than relying on the consumer).

## Decision

**Match this exactly.** `IconButton` (`packages/design-system/src/components/IconButton/IconButton.tsx`) has no relationship to `BaseButton` beyond reusing the `ButtonIconComponent` type (exported from `BaseButton.tsx` specifically for this reuse — the icon component shape is identical, no reason to duplicate a one-line type alias). Its own render function, its own CSS file (`icon-button.css`), its own class namespace (`.ds-icon-button*`, disjoint from `.ds-button*`).

## Consequences

- No shared internals to keep in sync between `Button` and `IconButton` — a change to `Button`'s variant/color model has zero effect on `IconButton`, and vice versa, matching Blade's own real independence.
- `type="button"` is not even a prop on `IconButtonProps` — hardcoded in the render, matching Blade's real safety default exactly.
- See `decisions/decision-button-basebutton-split.md` for the parallel reasoning on why `Button` itself *does* get an internal/public split (a different question — that's about `BaseButton` vs. `Button`, both still fundamentally the "bordered/filled" component family).
