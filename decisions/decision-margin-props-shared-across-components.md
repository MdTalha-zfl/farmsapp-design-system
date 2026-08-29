# Shared `MarginProps` on Button, IconButton, Spinner, Badge — real Blade parity

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button, IconButton, Spinner, Badge

## Context

User pushed back on `decisions/decision-badge-span-not-box.md`'s conclusion that Box provides no benefit to Badge/Spinner, specifically raising a real, concrete ergonomic gap: a consumer wanting `<Badge marginTop="...">` currently has to wrap it in a `Box` themselves. Asked to verify Blade's real answer before deciding, rather than reasoning about it in the abstract.

**Blade's real source, fetched directly from `razorpay/blade` on GitHub (not summarized/assumed):**

- `packages/blade/src/components/Badge/Badge.tsx` — `BadgeProps` intersects `StyledPropsBlade`, and the root render is `<BaseBox {...metaAttribute(...)} {...getStyledProps(props)}>`.
- `packages/blade/src/components/Spinner/BaseSpinner/BaseSpinner.tsx` — same pattern: `BaseSpinnerProps` intersects `StyledPropsBlade`, root is `<BaseBox {...metaAttribute(...)} {...getStyledProps(styledProps)}>`. This directly corrects `decision-badge-span-not-box.md`'s implicit assumption that Blade's own Spinner-equivalent has no Box involvement at all — it does, just not for the reason that decision was arguing against.
- `packages/blade/src/components/Button/BaseButton/types.ts` — `StyledBaseButtonProps` also intersects `StyledPropsBlade`.
- `packages/blade/src/components/Box/styledProps/getStyledProps.ts` — the real, curated prop list `StyledPropsBlade` covers: `alignSelf, display, justifySelf, placeSelf, order, position, zIndex, gridColumn(Start/End), gridRow(Start/End), gridArea, margin, marginTop/Right/Bottom/Left, marginX, marginY, top/right/bottom/left, visibility, flexWrap`. Notably **excludes** `padding`, `backgroundColor`, `borderRadius`, `width`/`height` — those stay each component's own internal concern, confirming the "closed prop surface for a component's own appearance" instinct from the earlier Badge/Box decisions was directionally right, just incomplete: Blade draws the line at *layout-in-parent* props (margin, position, self-alignment), not at zero external props.
- The file's own doc comment states this is genuinely uniform practice, not Badge-specific: *"How to add Styled Props to components?"*, with two documented paths — `getStyledProps` + a `BaseBox` wrapper (what Badge/Spinner/Button all use), or `useStyledProps` (a hook returning a CSS object, used by `BaseText` specifically to avoid an extra wrapper element when one "can cause styling issues or is unnecessary").

## Decision

**Add a shared `MarginProps` type** (`packages/design-system/src/components/Box/Box.tsx`) — a `Pick` of `BoxOwnProps`' 7 margin-family fields (`margin`, `marginTop/Right/Bottom/Left`, `marginX`, `marginY`) — and have `Badge`, `Spinner`, `BaseButton` (→ `Button`), and `IconButton` all extend it and apply it.

**Scoped to margin only, not Blade's full ~20-prop `StyledPropsBlade`.** No cited need yet for `position`/`zIndex`/`grid*`/`flexWrap`/`visibility`/`alignSelf` on any of these 4 components — same "don't build ahead of a real consumer" discipline already applied to Badge's color/size scope. Extend later if a real need shows up; this is additive, not a redesign.

**No wrapper element needed — a real, deliberate improvement over Blade's own mechanism, not just a port of it.** Blade *must* wrap in a second `BaseBox` because its Box is a runtime styled-components layer that needs an actual DOM node to attach a computed style object to. This project's `Box` only ever resolves props to plain class-name strings (`decisions/decision-box-atomic-css-over-inline-styles.md`), so the exact same margin classes (`.ds-mt-3`, already shipped in `atomic.css`) can be concatenated directly onto the *same* root element each component already renders. Implemented by reusing `resolveBoxClassNames` — already exported from `Box.tsx` for exactly this purpose (its own doc comment: *"a future component that can't just render `<Box as="...">`... but still wants to accept Box-style layout props... can resolve them to real class names the same way Box itself does, without duplicating this function"* — written before any real consumer existed, now consumed for the first time).

Each component destructures its own named props plus `...marginProps`, then does `resolveBoxClassNames(marginProps)` and concatenates the result into its existing hand-written class list (before `className`, so a consumer's own `className` still wins on tie).

## Consequences

- `<Badge marginTop="4">`, `<Spinner marginLeft="3">`, `<Button marginBottom="2">`, `<IconButton marginX="1">` all work directly today — no wrapper `Box` needed, resolved via classes already present in the shipped `atomic.css` (no regeneration needed, confirmed: `.ds-mt-3` etc. already existed from `Box`'s own usage).
- Corrects, rather than reverses, `decisions/decision-badge-span-not-box.md`: that decision's root-element conclusion (raw `<span>`, not `<Box as="span">`) still stands — Box's tag-validation/style-stripping logic is still unused — but its "Box provides zero benefit" framing was incomplete. The real dividing line is "does this component expose *any* Box-shaped prop," not "does it expose Box's *entire* prop surface." Updated that decision's Consequences section to point here instead of leaving the gap open-ended.
- `VisuallyHidden` deliberately excluded: `children` only, no id, no focus-reveal by design (`decisions/decision-visually-hidden-minimal-scope.md`) — a margin override on invisible content has no real use case, and Blade's own real `VisuallyHidden` (traced earlier this project) has no `StyledPropsBlade` either, so this isn't an inconsistency, it's the same "closed prop surface where it's actually closed" call.
