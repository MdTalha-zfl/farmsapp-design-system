# Typography uses rem, everything else stays px

- Status: accepted (revised same day — first pass wrongly landed on all-px before Blade's real RFC on this exact question was found)
- Date: 2026-08-22
- Context: raised by the user while reviewing `packages/tokens/tokens/*.json` in Phase 5 — no prior decision log or design doc had actually addressed this; `px` was simply what Token Foundation used from the start, never a deliberate call until now.

## Context

Every dimension token (`spacing.json`, `radius`/`borderWidth` in `spacing.json`, `focus.json`'s ring width/offset, `typography.json`'s `fontSize`/`letterSpacing`, `container.json`'s `maxWidth`) was authored in `px`. `rem` is relative to the root (`<html>`) element's font-size; `px` is absolute. The practical difference: a browser/OS "text size" accessibility setting (distinct from ordinary page zoom, which scales `px` and `rem` equally — confirmed below, not assumed) rescales every `rem` value automatically. `px` ignores it entirely.

## First pass, and why it was wrong

The first version of this decision kept everything in `px`, reasoning that a `rem` value is only as trustworthy as the root font-size staying consistent across both apps this one shared package serves (`consumer`, `portal`) — a real concern, but incomplete: it doesn't actually argue against using `rem` *specifically for type*, since `fontSize` is exactly the value a user's text-size accessibility setting is trying to control in the first place.

The user then supplied Razorpay Blade's actual, real RFC on this exact question (`Units for typography and layout`, Feb 2021) — the same reference system this whole project periodically checks itself against. Blade's own conclusion wasn't all-`px`. It was a **hybrid: typography in `rem`, layout in `px`** — with a sharper, more specific argument than the one above.

## What Blade's RFC actually found, and why it changes this decision

- **Why not "everything `rem`":** if spacing/sizing were `rem` too, increasing font-size can shift which responsive breakpoint applies, since `rem`-based widths change along with the text — a user asking for bigger text silently gets a *different layout*, not just bigger text in the same one. This is a concrete, specific failure mode, not a hypothetical.
- **Why `rem` for type specifically:** the accessibility win is real and worth taking — text should respect a user's text-size setting — and it doesn't carry the layout-breakage risk above, since type reflows within whatever container it's already in rather than crossing a media-query threshold itself.
- **A real, verified clarification, not assumed:** Blade's RFC investigated what browser zoom (Ctrl/Cmd +) actually does at the rendering level and confirmed it stretches raw hardware pixels uniformly — unaffected by whether the underlying CSS is `px` or `rem`. WCAG's literal 200%-zoom success criterion is satisfied by `px` content just as well as `rem`. The real, narrower gap `px` alone leaves open is specifically the *separate* browser/OS default-font-size setting, not zoom.
- **Their real-system survey:** Primer, Spectrum, Braid, Styled System defaulted `px`/`px` (two flagged "revisiting" even then); Chakra went `rem`/`rem`; Facebook went `rem` type / `px` layout — the same split Blade itself landed on.

## Decision

Match Blade's hybrid: `typography.json`'s `fontSize` scale is `rem` (0.75rem–2.25rem, each value the same physical size as its old `px` value at the standard 16px root — this is a unit change, not a resize). `letterSpacing` was already `em` (relative to the element's own font-size, correctly consistent already, no change needed). `lineHeight` was already unitless (also already correct — unitless line-height is the established best practice regardless of which unit `fontSize` uses). Every other dimension token — `spacing`, `radius`, `borderWidth`, `focus.json`'s ring width/offset, `container.json`'s `maxWidth` — stays `px`, for the media-query-stability reason above.

## Consequences

- **Real, accepted, narrower gap than the first pass:** layout dimensions (padding, margin, radius, border-width, focus ring, container max-width) still won't respond to a text-size accessibility setting — deliberate, matching Blade's own reasoning about media-query stability, not an oversight.
- Zero blast radius on shipped code: verified by grep that nothing in `packages/design-system/src` references `font-size`/`fontSize`/`--ds-text-*` yet — `Text`/`Heading` (Phase 5 Chunk 04) haven't been built. This is the correct point in the project to make this change, before anything is built on top of the old values.
- Composite `text.*` tokens (`semantic-typography.json`) reference `fontSize` by DTCG alias (`{fontSize.700}`), never a hardcoded duplicate value — confirmed by rebuilding and inspecting the generated CSS `font` shorthand output directly: every composite token's `var(--ds-font-size-*)` reference now resolves to the new `rem` value automatically, no token file beyond `typography.json` itself needed editing.
- Re-verified: tokens' own contrast check (40/40, unaffected — a unit change doesn't touch color), full fresh `turbo run build lint typecheck --force` across the workspace (19/19).
