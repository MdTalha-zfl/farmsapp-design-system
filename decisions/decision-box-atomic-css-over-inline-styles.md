# Box resolves style props to pre-generated atomic CSS classes, not runtime styles

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 02 — Box. Resolves the performance decision decision-box-must-use-css-custom-properties.md deliberately left open.

## Context

Three factors already pointed away from Blade's approach (styled-components, runtime CSS-in-JS) before this chunk started: Blade's own real per-render cost (~70-prop walk × up to 5 breakpoints per cache miss, confirmed by reading its source), this project's locked low-end-device/weak-connectivity audience, and Next.js App Router's real friction between styled-components' SSR style-collection model (assumes one synchronous render pass) and React Server Components + streaming.

That framing was still incomplete. Blade's "runtime" specifically means *injecting a `<style>` tag at runtime* — that's what causes the RSC friction. A simpler runtime option exists that the three-factor framing skipped: React's native `style={{...}}` attribute, resolved by a plain function, no CSS-in-JS library at all. It avoids the RSC friction entirely (inline styles just serialize into HTML — no stylesheet-collection step, nothing for streaming to conflict with) and is cheaper than Blade's object-building. It was rejected anyway, for a reason specific to this project: **inline styles cannot contain `@media` conditions** — a CSS/HTML constraint, not an implementation detail — which would break the already-committed responsive-prop requirement for Container (and now Stack/Inline).

A fourth option, not in the roadmap's original runtime-vs-compile-time framing, turned out to fit this project's specific situation better than either: this system already has a proven, working CSS generation pipeline (Style Dictionary → `tokens.css`), and Box's prop value space is already constrained to token steps, never arbitrary CSS (an existing hard rule, not new). Instead of resolving props to styles at render time at all, extend that same pipeline to generate a small, finite set of utility classes at token-build time. Considered and rejected against this: a real compile-time CSS-in-JS tool (vanilla-extract/Panda) — its typical compilation model assumes it runs inside an *application's* bundler, and this project publishes `@farmsapp/design-system` as a separately-versioned npm package consumed by multiple different apps' own bundlers; that library-packaging story is a real, separate unknown not worth taking on speculatively when the existing pipeline already does the job.

## Decision

`Box` resolves every style prop to a class name string against a fixed, generated stylesheet (`build/css/atomic.css`), never a runtime style object.

- `packages/design-system/src/atomicConfig.mjs` is the single source of truth for the prop surface (which props exist, their CSS properties, their token-scale category) — imported by both `scripts/generate-atomic-css.mjs` (Node, build time, writes the CSS) and `Box.tsx` (produces the same class names at render time), so the two can't drift apart.
- The generated CSS lives in the already-reserved `tokens.component` cascade layer (Theme Runtime's five-layer declaration — highest precedence, exactly where component-level styling belongs).
- Responsive variants use a dedicated breakpoint scale (decision-component-breakpoint-scale.md), generated as real `@media` blocks — the actual reason inline styles were disqualified.
- Every generated rule references `var(--ds-*)`, never a resolved literal, satisfying decision-box-must-use-css-custom-properties.md by construction: the generator never reads token *values*, only step *names*, so there's nothing to flatten.

### The real measurement

Built `scratch-bench.mjs` (throwaway, deleted after use): 500 Box-density instances (12 props each: padding, flex layout, gap, three semantic colors, radius, border-width), rendered via `renderToString`, 20 iterations with 3 discarded as warmup, compared against a naive hand-written inline-style resolver mirroring Blade's own real (initially unmemoized) per-render object-building approach.

First run: the naive inline-style version measured **faster** (atomic classes were 0.87-0.88x — slower). Investigating why turned up a real bug in `Box.tsx`'s first draft: its resolver looped the *entire ~27-key prop schema* on every render checking each key against the actual props passed, rather than looping the props actually passed and looking up config for each — the same class of mistake already flagged in Blade's real `BaseBox` (walking a large fixed schema regardless of usage). Fixed by building one `Map` at module load and iterating `Object.entries(props)` instead (bounded by what a given instance actually sets, not by schema size). Re-measured: atomic classes came out at 1.02-1.14x across three separate runs — roughly at parity with, slightly ahead of, the naive approach.

Honest conclusion: once both are implemented efficiently, raw per-render JS resolution cost is **not** the deciding factor — it's close enough to call a wash. The decision rests on the structural properties that don't show up in a `renderToString` timing loop: real `@media` support (inline styles categorically can't), no runtime `<style>`-tag injection to conflict with RSC/streaming (unlike Blade's styled-components path), and CSS payload that stays bounded regardless of instance count (a shared, cacheable stylesheet vs. a per-instance inline style string repeated in every element's HTML). This is a more defensible reason to choose atomic classes than "it measured faster" would have been, and it's the one that would have survived the benchmark going the other way.

## Bugs the live verification caught (not tsc/eslint — both fully valid TypeScript)

Wired Box into `apps/playground` temporarily (throwaway consumption probe, fully reverted) and drove it with a real browser (playwright-core via the system Edge, matching the established Theme Runtime verification method):

1. **Box never rendered its children.** `children` was included in the "own props" exclusion set used to filter what gets forwarded to the rendered element, so it was filtered out of `rest` and never re-added anywhere. Every Box rendered as an empty element. Fixed by excluding `children` from that filter set — it's a pass-through prop, not a style prop, and needed to flow into `rest`.
2. **`border-width` alone has zero visual effect.** A real CSS behavior, not implementation-specific: `border-style` defaults to `none`, and a border computes to 0 width regardless of `border-width` when its style is `none`. A Box with `borderWidth="thin"` rendered with a computed `0px` border. First fix: bundled `border-style: solid` into the generated rule for both `borderWidth` and `borderColor`. That fix was itself incomplete — see the hardening pass below.
3. The `\@` escape needed for responsive class selectors (`.ds-p-2\@md` in CSS vs. the literal `ds-p-2@md` string in the DOM's `className`) was caught and fixed before the browser check, by re-reading how Tailwind's own generated output handles the same problem for `:` — an unescaped `@` isn't a valid CSS identifier character.

All three were real, silent failures a type-checker or linter has no way to see — the design system's own stated verification standard (real build, real browser, not trusting exit codes) is what caught them.

## Hardening pass — a permanent Box variant gallery, and a follow-on bug in bug #2's own fix

Before Chunk 03 (Stack/Inline/Container) builds on Box, exercised every prop and every value in a permanent `apps/playground` fixture (not a throwaway probe this time — playground's own purpose is exactly this) and actually looked at screenshots in both themes, not just ran assertions.

Found bug #2's fix was itself incomplete: bundling `border-style: solid` into *both* `borderWidth` and `borderColor` meant setting `borderColor` alone (no `borderWidth`) now got `border-style: solid` with no explicit width — and the browser's own default border-width (`medium`, ~3px) applied, a real unwanted border. An automated assertion caught it (`0px` expected, `3px` got), not the screenshot. Corrected: `border-style: solid` now lives on `borderWidth` alone, not `borderColor`. Setting `borderColor` with no `borderWidth` has no visible effect — a real, known CSS behavior, and deliberately not papered over, since there's no single "right" width to imply from a color alone. This matches Tailwind's own resolved convention for the identical tension (their border-color utilities require a border-width utility too).

Also found, via screenshots specifically (not assertions): with no page-level base/reset stylesheet anywhere in this project, any Box content that doesn't set its own `color` prop inherits the browser's default black text, which is illegible against a dark `backgroundColor` in dark mode. Not a Box bug — Box correctly does nothing you didn't ask for — but a real gap: nothing establishes a theme-aware default text/background color at the page level. Worked around in the gallery by setting `color="primary"` once on the root and relying on CSS inheritance. Raised where a base layer should live (tokens.css? design-system's atomic.css? each consuming app's own responsibility?) as a question — **explicitly deferred by the user, 2026-08-22**: not building it now, revisit when a real app-shell/layout chunk exists. Until then, every consuming app (including this project's own `apps/playground` and `apps/docs`) is responsible for its own body-level defaults, same as it's already responsible for wiring `getThemeInitScript()`.

## Consequences

- Extending Box's prop surface (needed by Stack/Inline/Container/Text, Chunks 03-04) means adding an entry to `atomicConfig.mjs` and regenerating — never hand-editing CSS or duplicating the prop-to-class naming convention in a second place.
- `generate-atomic-css.mjs` reads token step *names* directly from `@farmsapp/tokens`' JSON source (not its published build output) — a deliberate build-time-only shortcut across the package boundary, since tokens doesn't publish step-name metadata as its own output yet. Revisit if a second consumer needs the same list.
- Box's prop surface stays deliberately finite (spacing, layout/flex, semantic color, radius, border-width) — not the full CSS surface. `borderStyle`, sizing (`width`/`height`), and position are out of scope until a real primitive built on Box (Stack, Inline, Container, Text) actually needs one.
