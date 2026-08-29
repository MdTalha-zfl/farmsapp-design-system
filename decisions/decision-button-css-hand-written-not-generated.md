# Interactive-state CSS is hand-written and merged verbatim, not generator-extended

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button/Spinner

## Context

No pseudo-class (`:hover`/`:active`/`:focus-visible`) CSS exists anywhere in this codebase before this chunk — every prop-driven class `generate-atomic-css.mjs` emits is static and state-independent (Box/Stack/Inline/Container/Text/Heading/Icon/VisuallyHidden never needed interaction state). Button is the first real consumer. Two real options existed: extend `atomicConfig.mjs`/`generate-atomic-css.mjs` with a pseudo-class-variant generation mechanism, or hand-write real CSS the way `base.css` already does for "fixed, non-scale-driven" rules.

## Decision

**Hand-written, committed stylesheets** (`Spinner/spinner.css` now; `Button/button.css` when Button itself lands), each self-wrapped in `@layer components { ... }`, read via `readFileSync` and concatenated into `build/css/atomic.css` by `generate-atomic-css.mjs` — exactly the same "hand-written, read-and-included-verbatim" discipline `base.css` already established, generalized from a single file to a list (`componentCssFiles` in `generate-atomic-css.mjs`) that new components append to as they ship their own CSS.

**No atomic-generator extension.** Interactive states aren't a token-scale-driven value space the way padding/color steps are — they're a small, fixed set of real CSS rules per component, the same category of thing `KEYWORD_PROPS`/`base.css` already hand-write rather than derive.

**A new `components` cascade layer**, appended after `tokens.component` (highest priority): the leading bare statement changed from `@layer base, tokens.component;` to `@layer base, tokens.component, components;`. `.ds-button*`/`.ds-spinner*` are a disjoint class namespace from Box's atomic classes (`.ds-p-*`, `.ds-bg-*`, ...) and never apply to the same element, so there's no real specificity conflict — the layer exists for clean separation and predictable override order, not to resolve a collision.

**One CSS export preserved.** `@farmsapp/design-system` already has exactly one CSS export (`./css` → `build/css/atomic.css`); folding component CSS into the same generated file (rather than giving each component its own export, the way `@farmsapp/icons` does for `icon.css`) keeps that guarantee — Button/Spinner consumers don't need a second import. `@farmsapp/icons` needed its own separate `build/icon.css` + `./css` export because it's a genuinely separate npm package with no existing merge point; `@farmsapp/design-system` already has one.

## Consequences

- A real, self-inflicted bug was caught during this chunk's own verification, not assumed away: the new header comment added to `generate-atomic-css.mjs`'s output template contained the literal text `(src/components/*/*.css)` — the `*/` inside that glob pattern prematurely closed the CSS `/** ... */` block comment wrapping the whole file. Everything from that point through the entire `@layer base { ... }` block (body's `color`/`background-color`/`font-family`, `.ds-visually-hidden`) was silently swallowed by the browser's CSS error-recovery, while `@layer tokens.component { ... }` (which came after) parsed fine. Caught by directly inspecting the real, live `document.styleSheets` CSSOM in a real browser (not by reasoning about the generated text) — `body`'s computed `color` was flat `rgb(0,0,0)` instead of the expected theme token in both light and dark, which is what surfaced it. Fixed by rewriting the comment to avoid the glob syntax entirely. A reminder that CSS block comments in generated-and-concatenated output are a real hazard whenever the generator's own JS comments describe file-glob patterns — worth a second look if a future component CSS file's own doc comment does the same.
- Verified in a real browser after the fix: all 4 top-level layer rules (`base`, `tokens.component`, `components`, plus the reduced-motion media query) parse correctly and in the right order; `body`'s color/background and `.ds-visually-hidden`'s clip/position rules resolve to their real expected values in both themes.
