# Brand overrides target primitive custom properties, not semantic ones

- Status: accepted
- Date: 2026-08-21
- Context: Theme Runtime Chunk 05 (brand-override axis)

## Context

The cascade-layer order is fixed by System Blueprint §05: `tokens.primitive, tokens.semantic, tokens.brand, tokens.theme, tokens.component`. Cascade layer precedence is unconditional — a later-declared layer's declaration wins over an earlier layer's declaration for the same property, regardless of selector specificity (proven live in Chunk 04).

`tokens.brand` sits *before* `tokens.theme` in that order. `data-brand` and `data-theme` are meant to be independent axes — a customer can be on the pilot brand *and* dark mode at the same time, and both should apply.

## The problem with the obvious approach

The obvious first implementation is to have `[data-brand="pilot"]` in the `tokens.brand` layer override the *semantic* token directly, e.g.:

```css
@layer tokens.brand {
  [data-brand="pilot"] { --ds-color-action-primary: #7c3aed; }
}
```

This breaks the moment dark mode is also active. `tokens.theme`'s dark override for the same property —

```css
@layer tokens.theme {
  [data-theme="dark"] { --ds-color-action-primary: var(--ds-color-brand-dark-9); }
}
```

— is in a *later* layer, so it always wins for that property when `data-theme="dark"` is present, regardless of what the brand layer declared. The brand override would silently vanish in dark mode and fall back to the host app's default brand — exactly the "dark + brand is a special case" bug the roadmap explicitly requires this chunk to rule out.

## Decision

Brand overrides target the underlying **primitive** custom properties (`--ds-color-brand-9`, `--ds-color-brand-10`, and their dark counterparts `--ds-color-brand-dark-9`, `--ds-color-brand-dark-10`), not the semantic ones:

```css
@layer tokens.brand {
  [data-brand="pilot"] {
    --ds-color-brand-9: #<pilot-9>;
    --ds-color-brand-10: #<pilot-10>;
    --ds-color-brand-dark-9: #<pilot-dark-9>;
    --ds-color-brand-dark-10: #<pilot-dark-10>;
  }
}
```

This works because of how `var()` actually resolves, not because of layer order: a custom property reference resolves against whatever that property's cascaded value *currently is* at paint time, regardless of which layer either the referencing or the referenced declaration came from. `tokens.semantic`'s `--ds-color-action-primary: var(--ds-color-brand-9)` and `tokens.theme`'s dark equivalent referencing `var(--ds-color-brand-dark-9)` both automatically pick up the brand layer's override — with zero changes to the semantic or theme layers, and brand's fixed earlier position in the layer order stops mattering, because the override never has to "win a layer fight" against theme at all.

## Consequences

- A brand override only needs to touch the specific primitive steps that semantic tokens actually reference (currently `brand.9`/`brand.10` in both contexts) — not redeclare every downstream semantic token.
- This generalizes: any future brand-scoped override should target primitives, never semantics, for the same reason.
- Verified live (not just reasoned about): `data-brand="pilot"` alone changes `action.primary`'s computed color in light mode, and `data-brand="pilot"` + `data-theme="dark"` together still reflects the pilot's *dark*-tuned brand color, not the default brand's dark value.
- Same structural pattern as Chunk 03's dark semantic tree: the pilot brand's token source needs its own independent Style Dictionary instance, since its token paths (`color.brand.9`, `color.brand-dark.9`) deliberately collide with the real primitive file's paths, and Style Dictionary resolves one source tree into one token tree before any output filtering happens.
