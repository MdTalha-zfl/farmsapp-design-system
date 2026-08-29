# Badge `shape` prop: `rounded` (pill) / `square` (default) — a real addition beyond Blade

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Badge

## Context

Blade's real Badge has no shape axis at all — `getStyledBadgeStyles.ts` applies a fixed `theme.border.radius.max` (pill) at every size, confirmed directly from source and already captured in `decisions/decision-badge-size-scale-drops-xsmall.md`. This project wants both a pill badge and a less-rounded "square" (softly-rounded-corner) badge as real, independent looks — added directly by the user during this component's build, not found in the Blade trace.

## Decision

**`shape?: "rounded" | "square"`, defaulting to `"square"`.** `rounded` maps to `radius.full` (Blade's own fixed value, kept as the alternate — not the default — since the default output changed for this project specifically); `square` maps to `radius.sm` (4px), a softly-rounded rectangle, not a literal 0px corner. Independent of `size`/`color`/`emphasis` — every combination of the 4 props is valid, matching how `color`×`emphasis` are already independent axes.

This corrects `decision-badge-size-scale-drops-xsmall.md`'s original "border-radius is fixed at every size" claim: that claim is still true *per shape* (radius doesn't vary by `size`), but radius is no longer fixed overall — `shape` is the axis that controls it now.

## Consequences

- `badge.css` gains `.ds-badge--shape-rounded`/`.ds-badge--shape-square`, each setting only `border-radius` — independent of the existing `--size-*`/`--color-*`/`--emphasis-*` classes, no combinatorial CSS growth.
- Every existing Badge story/usage written before this prop existed now renders `square` (the new default) instead of Blade's own pill shape — a real visual change to the default look, not just an additive opt-in. Worth a visual check once a real browser/Storybook look is done, per the still-outstanding item from earlier this session.
