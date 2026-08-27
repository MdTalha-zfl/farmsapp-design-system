# Font loading (Noto Sans / Noto Sans Devanagari) deferred, not built in Phase 5 Chunk 04

- Status: accepted (deferral, not a rejection)
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 04 — Text, Heading

## Context

Starting Chunk 04 (Text/Heading), checked what actually loads Noto Sans / Noto Sans Devanagari onto a page today — grepped the whole repo for `@font-face`, `.woff2`, a Google Fonts link, anything. Found nothing, anywhere. `typography.json`'s `fontFamily.body` is a CSS font-stack string (`"Noto Sans", "Noto Sans Devanagari", "sans-serif"`) that only actually renders as Noto Sans if the font is loaded some other way — a mechanism that has never been decided or built. Every user currently sees the browser's default `sans-serif` fallback, silently.

This is more foundational than a Text/Heading implementation detail — it's a real prerequisite gap, not something to assume a default for mid-chunk.

## Decision

Deferred entirely for this chunk. `Text`/`Heading` are built against the token system (`font: var(--ds-text-*)`) as if the real fonts were loaded, and ship rendering the `sans-serif` fallback until font loading gets its own dedicated chunk.

Reasoning, given the two real alternatives considered:
- **Self-hosting with real per-script subsetting** (the option this project's own low-end-device/weak-connectivity audience constraint would favor) is a substantial task on its own: sourcing real `.woff2` files, computing real `unicode-range` subsets per script, deciding where font assets live in the monorepo (a new `packages/fonts`?), writing `@font-face` CSS that works identically for both Vite (`apps/playground`) and Next.js (`apps/docs`), and — per the Blade comparison research from Phase 2 — tuning fallback-face metrics (`size-adjust`/`ascent-override`) to avoid layout shift before the real font loads. None of that is Text/Heading's own concern; bundling it into this chunk would have meant Text/Heading's actual API design (the harder, more central question) waiting on a large, mostly-unrelated infrastructure task.
- **Google Fonts CDN link** was rejected as the default, not just deferred — it adds an external DNS/connection round-trip on every page load, working directly against the weak-connectivity constraint this project has already committed to elsewhere (motion tokens, the mono font choice in Token Foundation Chunk 04).

## Consequences

- `Text`/`Heading` render real, correct typography *scale* (font-size, weight, line-height all resolve correctly via `var(--ds-text-*)`, verified in a real browser) but the actual *typeface* is the browser's fallback `sans-serif` until font loading is built — an honest, visible gap, not a silent one, since the fallback is exactly what the token's own CSS font-stack already specifies for this case.
- Font loading is now explicitly open, tracked work — not implicitly "done" because Text/Heading exist. When it happens, the leading candidate (per the reasoning above) is self-hosted subsetted fonts in a new `packages/fonts` package, but that's not decided yet either — deliberately left for its own chunk with its own real investigation, not pre-committed here.
