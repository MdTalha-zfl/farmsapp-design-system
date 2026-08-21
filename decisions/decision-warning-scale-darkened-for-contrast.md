# Light-mode warning scale shifted 0.10 darker (steps 9-12)

- Status: accepted
- Date: 2026-08-21
- Context: Theme Runtime Chunk 06 (contrast validation)

## Context

Chunk 06 built a build-time WCAG contrast checker covering every color pairing the design system actually controls (light, dark, and brand-pilot contexts). On its first run it found three real failures, all tracing to the same token: light-mode `feedback.warning` (`color.warning.9`, `#a46e00`).

| Pairing | Ratio | Needed |
|---|---|---|
| `text.inverse` on `feedback.warning` (button/badge text) | 4.32:1 | 4.5:1 |
| `feedback.warning` on `surface.base` (inline status text) | 4.32:1 | 4.5:1 |
| `feedback.warning` on `feedback.warning-subtle` (banner text) | 3.56:1 | 4.5:1 |

This was never caught before because Token Foundation Chunk 03 only checked contrast for the primitive scale's dedicated *text* steps (11/12) against white. Step 9 was designed as a "vivid status/solid" color, not a text color — nobody had checked whether it holds up once semantically reused as `feedback.warning` and actually rendered as text or paired with its own subtle background.

## Decision

Shifted the light `warning` family's lightness curve for steps 9-12 uniformly 0.10 darker (`[0.58, 0.5, 0.4, 0.28]` → `[0.48, 0.4, 0.3, 0.18]`), chroma curve unchanged. Verified via Chunk 02's own clamp-seam diagnostic that this didn't introduce a new gamut-clamping cliff (the increased clamping at those steps is a gradual taper toward the gamut ceiling, consistent with the pattern already accepted for `success`/`danger`, not an isolated jump). Re-ran the contrast checker: 40/40 pairings pass.

### Alternative considered: only change step 9

Rejected. Steps 9 and 10 (`action.primary` / `action.primary-hover`-equivalent for warning) need to stay visually distinct — shifting only step 9 down would have collided it with step 10's existing lightness (both ending up near 0.5) or required a separate, disconnected fix for 10. A uniform shift across 9-12 preserves the existing inter-step deltas that Chunk 02 already tuned for smoothness, so the fix is one coherent curve change instead of two independent patches that could drift out of sync later.

## Consequences

- `warning` now sits noticeably darker/more muted than `danger` and `success` at the same steps — a real, visible change to the amber hue's character, not just a technical value tweak. Amber is inherently harder to make AA-legible at high lightness than red or green (this echoes the Chunk 02 finding: near-white text/backgrounds have a much tighter usable chroma range for warm hues).
- Any future primitive hue addition should run through `check-contrast.mjs` before being treated as done — a scale can pass every "does this look smooth" check from Chunk 02 and Token Foundation Chunk 03 and still fail real accessibility once reused semantically. Contrast against the *actual* pairings a token is used in has to be checked explicitly; it doesn't fall out of the generation curve being smooth.
