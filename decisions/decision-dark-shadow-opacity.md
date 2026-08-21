# Dark-mode shadows: retuned opacity, not a copy of the light values

- Status: accepted
- Date: 2026-08-21
- Context: Theme Runtime Chunk 07 (phase close-out re-check)

## Context

The phase's close-out re-check (the same habit that caught Phase 2's missing focus states and Phase 3's undocumented z-index reasoning) found that `shadow.raised`/`shadow.overlay` — and the `elevation.card`/`elevation.dialog` semantic tokens that alias them — are hardcoded black rgba values with no dark-mode variant. This is a real gap in the phase's own stated scope ("the semantic tier's dark-mode values," delivered for color in Chunk 03 but never extended to shadow). Nothing consumes these tokens yet (no Card/Dialog component exists before Phase 5+), but the values themselves needed to exist and be correct before this phase could honestly call itself done.

A pure-black shadow at the light-mode opacities (4-16%) is close to invisible against a near-black dark-mode surface, since shadows work by darkening relative to a *lighter* surrounding surface — the same underlying category of problem the primitive color scales solved in Chunk 02 ("independently tune, don't invert"), just applied to shadow alpha instead of OKLCH lightness/chroma.

## Decision

Computed the actual composited lightness delta (not guessed) for various black-alpha values over the dark-mode surface colors (`neutral-dark.1` at OKLCH L≈0.151, `neutral-dark.2` at L≈0.184):

| Alpha | Δ L on surface.base | Δ L on surface.raised |
|---|---|---|
| 8% (light-mode value) | 0.0044 | 0.0067 |
| 25% | 0.0141 | 0.0212 |
| 35% | 0.0205 | 0.0299 |
| 45% | 0.0276 | 0.0387 |
| 65% | 0.0449 | 0.0591 |

Even at 65% alpha, the delta caps around 0.045-0.06 — black composited over an already-near-black color has little room to darken further, confirming the concern was real and quantifying exactly how real. Chose alphas that land in the same perceptible range as an adjacent primitive scale step (~0.02-0.03 L, the smallest gap already proven distinguishable elsewhere in this system): 35% for `resting`, 45%/25% for `raised`'s two layers, 60%/35% for `overlay`'s two layers (the most prominent tier, sized up accordingly). Geometry (offset/blur/spread) is unchanged from the light values — only the alpha needed retuning, since the shadow's shape doesn't depend on the surface it's cast on.

Structurally, this reuses the exact isolated-tree pattern already established for color: `tokens/shadow-dark.json` (primitive, `-dark` suffix convention, no path collision, flows through the main build like `color-dark.json` did) and `tokens/semantic-elevation-dark.json` (needs its own isolated Style Dictionary source tree, same collision reason as every other dark-semantic file). The dark-semantic file filter (`isSemanticDarkFile`) was generalized from a single hardcoded filename to a naming-convention check (`tokens/semantic-*-dark.json`) so a third dark-semantic category later doesn't need a code change here.

## Consequences

- There's no formal accessibility standard governing shadow visibility the way WCAG governs text contrast — this was a design judgment call, verified against a self-consistent, already-established perceptibility bar (the primitive scale's own step deltas), not an externally-mandated threshold. Worth remembering this is a different *kind* of verification than Chunk 06's contrast gate, even though both used real computed numbers.
- Not visually verified in a rendered browser — no component exists yet that applies a `box-shadow`. Verified structurally instead (the CSS custom property override chain read directly from real build output), the same category of verification already used for anything without a live consumer yet in this project. Should get a real visual check once Phase 5+ builds Card/Dialog and something actually casts a shadow.
