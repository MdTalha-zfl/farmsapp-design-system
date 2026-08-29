# Icon generation pipeline: `@svgr/core` (Node-script), two-layer generated components, no fill/stroke rewrite

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon, following a real trace of Blade's own icon codegen pipeline

## Context

Blade's real pipeline: Figma API → raw SVG → a `svgson`-based AST rewrite (every `fill`/`stroke` attribute rewritten to the literal string `{iconColor}`, since Blade's Figma-sourced SVGs bake in literal hex fills per shape) → a `node-plop` Handlebars template producing the final component. This project's own source (Lucide, `decisions/decision-icon-source-lucide.md`) and build tooling (a plain Node script per `generate-atomic-css.mjs`'s own established shape, not a Figma/plop combination) differ enough that Blade's pipeline needed real translation, not a direct port.

## Decision

**`@svgr/core` used directly from a plain Node script** (`packages/icons/scripts/generate-icons.mjs`), not `@svgr/webpack`/`@svgr/rollup`. Those two are wrapper layers built for a *bundler's* transform hook — irrelevant here, since generation runs once, ahead of time, from a CLI script (the same "generate fresh from committed source, on every build" shape `generate-atomic-css.mjs` already established), and its output is then compiled by Rollup like any hand-written component, not intercepted mid-bundle.

**No fill/stroke AST-rewrite step, unlike Blade's own pipeline.** Verified directly (not assumed) by reading real installed `lucide-static` source: every icon already declares `stroke="currentColor"` once on its root `<svg>`, inherited by every child automatically via ordinary SVG attribute inheritance. Setting CSS `color` on the root element (via `icon.css`'s `.ds-icon-color-*` classes) is sufficient — SVGR's job here really is just "parse SVG XML into JSX," nothing more.

**Two-layer generated output, not one custom SVGR `template`.** A fully custom SVGR template (directly injecting `aria-hidden`, ref-forwarding, and computed `className` into the parsed JSX via babel-template AST substitution) was considered and rejected as unnecessary risk for the value it would add. Instead:
1. SVGR's own **default** template (`ref: true`, `expandProps: "end"`, `typescript: true`) converts each raw SVG into a "raw" component (`src/generated/_raw/<Name>Raw.tsx`) — SVGR doing exactly what it's built and well-tested for, zero custom AST manipulation.
2. A thin, hand-templated wrapper (`src/generated/<Name>.tsx`, plain JavaScript string interpolation inside `generate-icons.mjs` — no SVGR template API involved) imports the raw component and applies this project's own `aria-hidden`/size/color logic via `resolveIconProps.ts`.

This trades a small amount of generated-file duplication (two files per icon instead of one) for a pipeline whose every piece is either SVGR's own well-tested default behavior or plain, directly-readable string templating — no risk of a subtly-wrong custom babel-template AST substitution shipping unnoticed.

**Two real bugs caught by inspecting actual generated output before trusting it, not assumed correct:**
1. SVGO's `preset-default` (run via `@svgr/plugin-svgo`) strips `viewBox` whenever it's numerically redundant with `width`/`height` — exactly Lucide's case (`viewBox="0 0 24 24"` + `width="24" height="24"`). Undetected, this would have silently broken proportional scaling the moment this project's own `.ds-icon-size-*` classes resize the icon via CSS. Fixed via `preset-default`'s own `overrides: { removeViewBox: false }`.
2. `verbatimModuleSyntax: true` (this project's tsconfig) requires `Ref` to be a type-only import; SVGR's default output imports it as a plain value import. Fixed with a deterministic string substitution on SVGR's own known output shape, applied inside `generate-icons.mjs` after calling `transform()`.

Both caught by actually running the generator and reading its real output/running `tsc` against it — not by reasoning about SVGR's behavior in the abstract.

**Lucide's own `class="lucide lucide-x"` attribute is stripped explicitly**, via an SVGO `removeAttrs` plugin targeting `class` — not part of `preset-default` (SVGO doesn't know `class` is meaningless once converted to a React component with its own `className`).

## Consequences

- `packages/icons/scripts/generate-icons.mjs` (new), `packages/icons/scripts/icon-list.mjs` (new), `packages/icons/src/resolveIconProps.ts` (new), `packages/icons/src/icon.css` (new).
- `packages/icons/rollup.config.mjs`'s entry point moved to `./src/generated/index.tsx`; the old placeholder `src/index.tsx` deleted.
- Real, verified output: 8 icons generated, `tsc --noEmit` clean, `eslint` clean, `rollup -c` produces a real, correctly-shaped `build/` (per-icon exports, real `.d.ts`, `icon.css` copied through).
