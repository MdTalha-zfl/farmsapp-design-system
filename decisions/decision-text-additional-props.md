# Text gains `weight`, `textDecorationLine`, `wordBreak`, `truncateAfterLines`

- Status: accepted
- Date: 2026-08-26
- Context: Phase 5 (Primitives), Chunk 04 — Text, requested directly by the user

## Context

Requested as four new props on `Text` (not `Heading` — none of these were asked for there, and `Heading`'s weight already comes from its composite `variant`'s `font` shorthand). Two real technical issues surfaced during design, resolved with the user before implementing rather than guessed:

1. The requested `textDecorationLine` union included `"dotted"`, which isn't a real `text-decoration-line` CSS keyword (the real values are `none | underline | overline | line-through`) — `dotted` is a `text-decoration-style` value. Shipping it as typed would have compiled fine and silently done nothing in the browser.
2. `wordBreak` was specified as raw `string`, unlike every other new prop (closed unions) — a typo like `"braek-all"` would have typechecked and silently failed at runtime.

## Decision

**`weight?: "regular" | "medium" | "semibold"`** — a real primitive scale (`typography.json`'s `fontWeight`, which also has `"bold"`, deliberately not exposed here per the exact scope requested). Token-backed, resolved the same way as `letterSpacing`/`color`: a new entry in `TOKEN_TEXT_PROPS` (`{ cssProps: ["font-weight"], prefix: "font-weight", varCategory: "font-weight" }`), reading real step names from `typography.json` rather than hand-listing them.

**`textDecorationLine?: "none" | "underline" | "line-through" | "dotted"`**, with `"dotted"` decided explicitly as a convenience value: selecting it applies both `text-decoration-line: underline` *and* `text-decoration-style: dotted`, via the same `extraDecl` mechanism `borderWidth`'s `border-style: solid` bundling already established — not a literal CSS keyword pretending to be one.

**`wordBreak?: "normal" | "break-all" | "keep-all" | "break-word"`** — the real, complete set of valid CSS `word-break` values, a closed union instead of the originally-specified raw `string`.

`textDecorationLine`/`wordBreak` are both fixed CSS keywords with no token-scale meaning (no brand/design decision embedded in "underline" or "break-all") — modeled as a new object, `TEXT_KEYWORD_PROPS`, shaped like `Box`'s own `KEYWORD_PROPS` (fixed value list, no `var()` reference) rather than like `TOKEN_TEXT_PROPS` (token-scale-derived). Kept separate from `KEYWORD_PROPS` itself for the same structural reason `TOKEN_TEXT_PROPS` is separate from `TOKEN_COLOR_PROPS`/`TOKEN_SCALE_PROPS` — `Box.tsx` never imports it, so these props can't leak onto bare `Box` the way `color`'s earlier leak did.

**`truncateAfterLines?: number`** — a real per-instance number, not a fixed design-token step, so it doesn't go through the atomic-class mechanism at all. Resolved via `Box`'s `unsafeStyle` escape hatch, computing the standard (if awkwardly-named) `-webkit-line-clamp` pattern: `display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: N; overflow: hidden; text-overflow: ellipsis`. Same mechanism `Container` already uses for its own dynamic, non-token `maxWidth` styling — a real per-instance value doesn't force a token to exist for it.

## A real cascade-order question, verified rather than assumed

`weight`'s `font-weight` and `variant`'s composite `font` shorthand both ultimately set the CSS `font-weight` longhand — whichever rule appears **later in the actual stylesheet** wins (CSS cascade, not DOM class-attribute order). Confirmed directly in the generated `atomic.css`: `variant`'s rules are written before `weight`'s (matching `TOKEN_TEXT_PROPS`' key order: `variant`, `letterSpacing`, `color`, `weight`), so `weight`'s rule is always later in source order and correctly overrides `variant`'s own font-weight component when both are applied. Verified in a real browser, not just by reading the generated CSS: `<Text variant="body" weight="semibold">` computes `font-weight: 600` (matching `semibold`), not `400` (`body`'s own default `regular`).

## Consequences

- 282 base CSS rules now (was 270 — 12 new: 4 `fontWeight` steps + 4 `textDecorationLine` values + 4 `wordBreak` values), 32 props total (was 29).
- Verified end to end in a real browser: `weight="semibold"` computes `font-weight: 600` vs. `weight="regular"`'s `400`; `textDecorationLine="dotted"` computes `text-decoration-line: underline` *and* `text-decoration-style: dotted` as two genuinely separate CSS properties; `wordBreak="break-all"` computes correctly; `truncateAfterLines={2}` produces a real, measured element height of exactly 2 lines (`48px` — this variant's real line-height, `24px`, times 2) despite the source text being many lines longer, confirming the clamp actually clips rather than just setting CSS properties that happen to be present.
- `apps/playground`'s permanent gallery gained real demo sections for all four props, covering every value.
- Full fresh `turbo run build lint typecheck --force`, 19/19.
