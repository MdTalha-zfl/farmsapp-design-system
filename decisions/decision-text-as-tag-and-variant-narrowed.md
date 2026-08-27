# Text: `as` is a closed 8-tag union, `variant` narrowed to `body`/`caption`

- Status: accepted
- Date: 2026-08-26
- Context: Phase 5 (Primitives), Chunk 04 — Text, requested directly by the user

## Context

`Text`'s first version matched every other primitive's convention: `as` was fully polymorphic (`T extends ElementType`), and `variant` mirrored the composite `text.*` token step names exactly (`"body-md" | "body-sm" | "caption"`). Asked to narrow both deliberately, not as a bug fix — a real API-surface decision.

## Decision

**`as` narrowed to a closed union**: `"p" | "span" | "div" | "abbr" | "figcaption" | "cite" | "q" | "label"` — tags that plausibly hold running/inline text, rather than any element `Box` itself would allow. `TextProps` dropped its generic type parameter entirely as a direct consequence — with a fixed, closed set of tags (not an open `T extends ElementType`), there's no per-call-site element type left to preserve, so `Text` needs none of the forwardRef-then-cast machinery every polymorphic primitive requires (the same simplification already found for `Heading`, `rca/rca-box-polymorphic-props-lost-type-safety.md`). Ref type is the general `HTMLElement` (matching `Box`'s own ref type) rather than one concrete element interface, since the 8 tags don't share a single DOM interface the way `h1`-`h6` do.

Underlying native props are typed off `ComponentPropsWithoutRef<"span">` as a representative shape (mirroring `Heading`'s own `ComponentPropsWithoutRef<"h1">` convention) — accepted tradeoff: a tag-specific attribute like `label`'s `htmlFor` isn't exposed through this typing. Not solved here since it wasn't part of the request; worth a follow-up decision if a real `as="label"` + `htmlFor` need shows up.

**`variant` narrowed to `"body" | "caption"`**, dropping the `body-md`/`body-sm` split from the public prop entirely — the first time any token-backed prop in this codebase doesn't mirror its underlying token step names 1:1. `"body"` maps to `"body-md"` internally (the more common default, not derived from any stated preference — worth revisiting if `"body-sm"` turns out to be needed and unreachable). The underlying `text.body-sm` token itself is untouched and still generates a real CSS rule (`ds-font-body-sm`) — just currently unreachable through `Text`'s own prop surface. No other consumer was affected: nothing else in this codebase referenced `body-sm` directly.

## Consequences

- `apps/playground`'s gallery had to migrate: `TEXT_VARIANTS` dropped `"body-md"`/`"body-sm"` for `"body"`/`"caption"`, and every literal `variant="body-md"` usage across the gallery (color swatches, the composed-card example, the root page body) became `variant="body"`.
- One usage broke in a way worth noting: `ComposedExample`'s card title used `<Text as="strong">` for semantic emphasis — `"strong"` isn't in the new `as` union. Resolved with `weight="semibold"` instead (a new prop from the same request, `decisions/decision-text-additional-props.md`), trading the semantic `<strong>` tag for a purely visual equivalent within the union as specified, rather than silently adding `"strong"` back to the list without being asked.
- Verified: full fresh `turbo run build lint typecheck --force`, 19/19, after the migration.
