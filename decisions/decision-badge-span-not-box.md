# Badge's root is a raw `<span>`, not `<Box as="span">`

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Badge

## Context

Box exists for primitives that expose Box's own open-ended layout-prop surface — `Stack`/`Inline`/`Container`/`Text`/`Heading` all extend `BoxOwnProps` (or a subset) and pass props straight through to `resolveBoxClassNames`, per `decisions/decision-box-atomic-css-over-inline-styles.md`. `Button`/`IconButton`/`Spinner`, by contrast, have a closed prop surface and their own hand-written, fixed CSS files in the `components` cascade layer (`decisions/decision-button-css-hand-written-not-generated.md`) — they never accept arbitrary Box-style props, so there's nothing for Box's resolution loop to do. `Spinner.tsx` (`<span role="status" className="ds-spinner">`) is the closest precedent: same shape of component (small, non-interactive, own fixed CSS), same choice.

Note this is a *different* reason than why `Button`/`IconButton` skip Box — Box's own `ALLOWED_AS_TAGS` explicitly excludes interactive elements (`button`, `a`, `input`), so those two have no choice in the matter. `span` is on Box's allowed-tag list; Badge's root *could* render through Box mechanically. The real question was whether doing so would buy anything.

## Decision

**Raw `<span className={classes}>`, matching `Spinner`'s precedent.** `Badge`'s `color`/`emphasis`/`size` all resolve to a fixed, closed set of classes from `badge.css`, not through Box's atomic prop resolution — using `<Box as="span">` here would pull in Box's `warnIfDisallowedTag` dev check (moot, the tag is hardcoded) and its `style`/`unsafeStyle` handling (moot, Badge exposes neither) for zero actual behavior gained.

The dividing line going forward: a primitive uses Box when it exposes Box's own generic style-prop surface to its caller (`Stack`/`Inline`/`Container`/`Text`/`Heading`); a primitive with its own fixed, hand-written CSS and a closed prop surface (`Button`/`IconButton`/`Spinner`/`Badge`) renders its native element directly, regardless of whether that element happens to be one Box would allow.

## Consequences

- `Badge`'s internal `<Text>` is still Box-backed (Text always renders through Box internally) — only the outer pill wrapper is a raw native element, exactly mirroring `Button`'s own root-is-raw-but-label-is-Text-is-Box-backed shape.
- **Update, same day:** the "if Badge ever needs generic layout props" caveat originally here turned out to be a real, immediate need, not a hypothetical — see `decisions/decision-margin-props-shared-across-components.md`. Blade's real source (fetched and checked directly) confirmed Badge/Spinner/Button all *do* accept a curated margin/layout prop subset in real Blade, just not the *entire* Box-shaped surface this doc was contrasting against. This doc's root-element conclusion (raw `<span>`, not `<Box as="span">`) still stands; only the "zero benefit, nothing to add" framing was incomplete.
