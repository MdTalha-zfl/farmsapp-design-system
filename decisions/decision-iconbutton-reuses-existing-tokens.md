# IconButton's emphasis/isHighlighted model reuses existing tokens — zero new additions

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — IconButton, user chose "full Blade parity" for the emphasis/isHighlighted scope

## Context

Blade's real `IconButton` resolves color via `theme.colors.interactive.icon[emphasisColor][...]` — a real, dedicated token subtree (`normal`/`subtle`/`disabled` states per emphasis role) this project doesn't have and hasn't adopted (the richer Blade interactive-state color model was deliberately deferred as premature earlier in this project's own history — see `project_blade_comparison_findings` memory). Only fragments of Blade's real `StyledIconButton.web.tsx` were traced this session, not the complete file — exact behavior for every state combination isn't fully known.

The user chose full parity for the **prop surface and behavior** (`emphasis: subtle|intense|moderate`, `isHighlighted`, the container-gating logic, the `size="large"` guard) — not necessarily a literal port of Blade's own internal token tree, which is a different, Blade-specific architectural choice this project has already diverged from elsewhere (Icon's `IconColor` reuses `TextColor` directly rather than adopting a dedicated `interactive.icon.*` tree, for the identical reason).

## Decision

**Confirmed Blade behavior maps cleanly onto tokens `Button`'s own chunk already added — zero new token additions:**

| Blade concept | This project's reuse | Confirmed in a real browser |
|---|---|---|
| `intense` icon color (rest) | `color.text.primary` | ✓ exact match, both themes |
| `subtle` icon color (rest) | `color.text.secondary` | ✓ exact match, both themes |
| icon color on hover/focus-visible (any emphasis) | `color.text.secondary` | ✓ exact match, both themes — matches Blade's real "dims to `.subtle` regardless of emphasis" rule (Blade's fragment confirmed this for `:focus-visible`; extended to `:hover` here for one consistent feedback mechanism, since the non-container path has nothing else to give feedback with) |
| `moderate`'s persistent background | `color.action.tertiary-hover` (`neutral.3`) | ✓ exact match, present at rest, unchanged by hover in this translation |
| `isHighlighted`'s hover/focus-visible background | `color.action.secondary` (`neutral.4`) | ✓ exact match, transparent at rest, revealed only on hover/focus-visible |
| disabled icon color | `color.text.disabled` | not separately re-verified — reuses the same mechanism already verified for `Button` |
| focus ring | `color.focus.ring` / `focusRing.width` / `focusRing.offset` | ✓ exact match, real keyboard `Tab` |

**Where Blade's exact CSS wasn't available**, the simplest, most internally-consistent translation was chosen rather than guessed at in detail — e.g. whether `moderate`'s background itself shifts further on hover isn't confirmed from Blade's fragments; this project's translation keeps it flat/persistent rather than inventing an unconfirmed third color tier.

## Consequences

- Real, useful reuse: `color.action.tertiary-hover`/`color.action.secondary` were added for `Button`'s own tertiary/secondary variants (`decisions/decision-button-flat-border-not-bevel.md`) and turned out to be exactly the right semantic fit for `moderate`'s persistent wash and `isHighlighted`'s hover reveal respectively — a real, non-coincidental sign that this project's token scale is internally consistent, not that the reuse was forced.
- A future literal `interactive.icon.*`-style token tree, if ever needed, is still possible without disrupting anything here — this chunk adds no new tokens to migrate away from.
