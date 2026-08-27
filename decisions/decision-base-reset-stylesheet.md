# Page-level base/reset stylesheet — closing a gap deferred since Chunk 02

- Status: accepted
- Date: 2026-08-27
- Context: Phase 5 (Primitives), post-Chunk 04 — closing a gap flagged (and deliberately deferred) since Box's original atomic-CSS build

## Context

`decisions/decision-box-atomic-css-over-inline-styles.md` found, via real browser screenshots, that with no page-level base/reset stylesheet anywhere in this project, any content that doesn't set its own `color` prop inherits the browser's default black text — illegible against a dark `backgroundColor` in dark mode. Explicitly deferred at the time ("revisit when a real app-shell/layout chunk exists"), worked around in `apps/playground`'s gallery by manually setting `color="primary"`/`backgroundColor="base"` on the root element (which, after the later Text/Heading color-ownership restructure, forced that root element to be a `Text` rather than a plain `Box`, purely to keep setting `color`). Revisited now that Box/Text/Heading are mature and the workaround's cost (every consuming app responsible for its own root-level color wiring) is well understood.

## Decision

A small, hand-written `packages/design-system/src/base.css`:

```css
@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background-color: var(--ds-color-surface-base);
    color: var(--ds-color-text-primary);
    font-family: var(--ds-font-family-body);
  }
}
```

**Deliberately minimal** — only `box-sizing: border-box` (so Box's own `padding`/`borderWidth` props behave predictably against an author-supplied width — the CSS default, `content-box`, makes padding add to width rather than being contained by it, a real surprise waiting to happen once a consumer sets an explicit `width` alongside Box's padding props) and the specific text/background color gap this was written to close. **Not** a Tailwind-preflight-style opinionated reset (no heading/list/link/form-element normalization) — nothing in this codebase needs that yet, and adding it speculatively is exactly the kind of scope this project avoids elsewhere.

**Lives in `@farmsapp/design-system`, not `@farmsapp/tokens`.** `tokens` is deliberately values-only — every file in it is custom-property definitions, never element selectors (the whole point of the primitive/semantic/brand/theme layer split). A reset targets real elements (`body`, `*`), which only belongs in the package that already does that (`atomic.css`'s own `.ds-*` utility-class selectors).

**Hand-written, not generated**, prepended verbatim into the existing `build/css/atomic.css` output by `generate-atomic-css.mjs` reading `src/base.css` with `readFileSync`. This is a handful of fixed declarations referencing specific token names, not a scale being iterated — the same "real, unchanging CSS, no external token source to derive from" reasoning `KEYWORD_PROPS`/`TEXT_KEYWORD_PROPS` already established for their own hand-listed values. Prepending into the same file (rather than a new `"./base-css"` export) means zero new import for consumers — `@farmsapp/design-system/css` is still the one CSS import every app needs.

**Cascade-layer ordering, verified rather than assumed.** `tokens.css` (loaded first, by import order, in every real consumer) declares the bare statement `@layer tokens.primitive, tokens.semantic, tokens.brand, tokens.theme, tokens.component;` — naming `tokens.component` last, i.e. highest priority. `atomic.css` now opens with its own bare statement, `@layer base, tokens.component;`, before defining `base`'s rules — since `tokens.component` is already a known layer name (from tokens.css) and `base` is new, this is the standard CSS mechanism for a later stylesheet to insert a new layer at a specific relative position (immediately before `tokens.component`) without having to redeclare the full token-layer order itself.

In practice this ordering barely matters for the color/background rules specifically — CSS gives a direct rule on an element unconditional priority over an inherited value regardless of layers, so any Box/Text/Heading that sets its own `color`/`backgroundColor` class was always going to win over `body`'s inherited default. It matters for correctness and for any future base-layer rule that might target the same specificity tier as a component utility.

## Consequences

- `apps/playground`'s root wrapper reverted from `<Text as="div" color="primary" backgroundColor="base">` back to a plain `<Box as="div">` — no longer needs to be a `Text` at all, since it no longer sets `color` itself. `color`/`backgroundColor` now come from `body`'s own base-layer rule and inherit down exactly as they did manually before.
- Verified in a real browser, both themes: `body`'s computed `background-color`/`color` match the exact expected token hex values (light and dark), every nested gallery section stays legible with the workaround fully removed, and a `box-sizing: border-box` check confirmed a padded Box with an explicit width doesn't grow past it.
- Full fresh `turbo run build lint typecheck --force` verified after this change.
