# Button: BaseButton (internal) / Button (public) split, matching Blade's real structure

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button, "strictly follow Blade's architecture" directive

## Context

Blade's real `Button` is a thin public wrapper (`Button.tsx`) around an internal, unexported `BaseButton` that holds every real rendering decision. Blade's own real `BaseButton.tsx`/`Button.tsx` source (pasted directly this session) confirms the split exists specifically so `BaseButton` can expose a wider prop surface (`intent`, `contrast`, more `color` values) to other *internal* Blade components (e.g. `Alert`, which needs a feedback-colored action button) without ever widening `Button`'s own public API.

This project has no internal consumer like Blade's `Alert` yet — nothing today needs a wider prop surface than `Button` itself exposes.

## Decision

**Adopt the split anyway.** `packages/design-system/src/components/Button/BaseButton.tsx` (internal, not exported from `index.tsx`) holds all real logic — icon-only detection, disabled/loading semantics, link-vs-button rendering, icon sizing. `Button.tsx` is a thin pass-through:

```tsx
export const Button = BaseButton as (props: ButtonOwnProps & { ref?: Ref<...> }) => ReactElement | null;
```

`ButtonOwnProps` is currently just a type alias for `BaseButtonOwnProps` — genuinely identical today, not narrower. The split is adopted purely for the structural seam it preserves: a future internal consumer (an `Alert`-equivalent, if one is ever built) can widen `BaseButtonOwnProps` alone, later, without ever touching `Button`'s public type — at effectively zero cost now, matching the same "cheap, zero-behavior-change seam" reasoning already used for `resolveBoxClassNames`' own export (`decisions/decision-export-resolve-box-class-names.md`).

**`IconButton` is explicitly NOT built on `BaseButton`** — matching Blade's real structure exactly, confirmed directly from Blade's source and explanation this session: `IconButton` has its own file tree (`StyledIconButton`, `tokens.ts`), no `variant`/`color` prop, a completely different color model (`emphasis`/`isHighlighted` vs. `BaseButton`'s variant×color matrix), different default shape (unboxed/transparent by default vs. `BaseButton`'s bordered/filled box), a different size scale (3 steps vs. 4, no `xsmall`), and a hardcoded `type="button"` safety default `Button` doesn't share. Reusing `BaseButton` for `IconButton` would mean threading "if IconButton, skip the background/border matrix" conditionals through already-dense code — Blade avoids that by keeping them genuinely separate, and this project does the same. `IconButton` itself is a separate, later chunk — not built in this pass.

## Consequences

- `BaseButton.tsx` and `Button.tsx` both live under `Button/`; `buttonTokens.ts` (pure-data size→icon/spinner-size maps, no color-token resolution — this project has none of Blade's runtime `theme.colors` lookup) is a third sibling file, mirroring Blade's real `buttonTokens.ts` structural role.
- No behavior difference from a single flat `Button.tsx` today — verified via `tsc --noEmit`/`eslint`/a full real-browser pass, all green, identical to what a flat implementation would have produced.
- `Button`'s exported prop types (`ButtonWithChildrenOwnProps`, `ButtonIconOnlyOwnProps`) are re-exports of `BaseButton`'s own types under public names — kept in sync by construction (a single source of truth), not by hand-duplication.
