# Badge emphasis (subtle/intense) maps onto 100% existing tokens

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Badge

## Context

Blade's real `getColorProps` ties `emphasis?: 'subtle' | 'intense'` (default `'subtle'`) to 3 separate role trees per color — `feedback.background/text/icon.<color>.<subtle|intense>`. This project's `semantic-color.json` is flatter: one solid value (`feedback.<color>`, step 9) and one subtle value (`feedback.<color>-subtle`, step 3) per color, with no dedicated text/icon sub-roles under `feedback.*`.

But two tokens already exist that solve exactly this problem elsewhere: `text.danger/warning/success` (step 11, whose own `$description` fields document them as purpose-built, contrast-verified colored text for use against light surfaces — "Same reasoning as text.danger", 11.99:1/13.65:1/11.25:1 light) and `text.inverse` (step-1 neutral, already used for text on solid dark backgrounds like a primary button).

## Decision

**Reuse those two roles directly instead of inventing a `feedback.text.*`/`feedback.icon.*` tree:**

| `emphasis` | background | text / icon |
|---|---|---|
| `subtle` (default) | `feedback.<color>-subtle` | `text.<color>` |
| `intense` | `feedback.<color>` | `text.inverse` |

Zero new color tokens added for Badge. Font-weight is tied to `emphasis`, not a separate prop, matching Blade's own real behavior confirmed via source and snapshot (`medium` weight at `subtle`, `regular` at `intense`) — `_decisions/decisions.md` on Blade's side shows `fontWeight` was explicitly removed as a standalone prop there too, so this isn't a Badge-specific invention, it's consistent with Blade's own resolved API shape.

**Open caveat, not yet verified:** `text.<color>`'s documented contrast numbers were computed against `surface.base`, not against `feedback.<color>-subtle` specifically. Both are light-tinted backgrounds so it's likely fine, but "likely fine" isn't "verified" — check contrast for real once Badge actually renders `subtle` emphasis in a browser, the same way Chunk 06's dark-scale contrast was verified by measurement rather than assumption.

## Consequences

- No `Badge`-specific or `feedback`-specific text/icon token tree needed — the color-resolution function is a straightforward table lookup over tokens that already exist and are already used elsewhere (Button, Text).
- The unverified-contrast caveat above must be closed out (real browser check) before calling `subtle` emphasis done, not assumed passing because the numbers "look colored enough."
