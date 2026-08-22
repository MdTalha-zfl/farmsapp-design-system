# Box's responsive props use their own breakpoint scale, not consumer/portal

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 02 — Box

## Context

`tokens/breakpoint.json` already has two locked, deliberately different scales — `consumer` (md: 600, lg: 900) and `portal` (md: 600, lg: 1280, xl: 1536) — for page-layout decisions (nav collapse, hero sections) in the two apps this system serves (Token Foundation Chunk 05).

Box's responsive style props (`p={{ base, md, lg }}`, etc.) need a breakpoint scale too, but for a structurally different reason: they get baked into **statically generated CSS** at build time (`generate-atomic-css.mjs` — see decision-box-atomic-css-over-inline-styles.md), shared as one build across every consumer of `@farmsapp/design-system`. A single component library build can't carry two different `@media` scales and have both apply correctly — whichever app imports the CSS gets whatever scale it was generated with.

Reusing `consumer` or `portal` directly would either hardcode component-level responsiveness to one app's page-layout breakpoints (wrong for the other app) or require two separate `@farmsapp/design-system` CSS builds (real new build complexity for a distinction — page layout vs. component props — that doesn't need to track the same breakpoints in the first place: a page's nav collapsing at a different width than its Stack's flex-direction switching is normal, not a bug).

## Decision

Added a third `breakpoint.component` group to `tokens/breakpoint.json`: `md: 600`, `lg: 1024`. One scale, two steps beyond `base`, shared by both apps for anything styled through Box/Stack/Inline/Container's own responsive props. Deliberately smaller than `portal`'s three extra steps — fewer generated `@media` blocks, smaller CSS payload, consistent with the low-end-device/weak-connectivity audience constraint.

`md: 600` intentionally matches both `consumer.md` and `portal.md` (600) — not a forced alignment, they already agreed; picking a different number here for no reason would just be a second thing to remember.

## Consequences

- A third, independent breakpoint concept now exists in the token source: page-layout breakpoints (per-app) vs. component-prop breakpoints (shared, fixed). Future primitives needing responsive props (Stack, Inline, Container, Text — Chunks 03-04) use `breakpoint.component`, not `consumer`/`portal`.
- If a real design need for a third component-level breakpoint step shows up later, it's one line in `breakpoint.json` plus a full atomic CSS regeneration — no code change to Box itself, since `generate-atomic-css.mjs` reads the breakpoint list, never hardcodes it.
