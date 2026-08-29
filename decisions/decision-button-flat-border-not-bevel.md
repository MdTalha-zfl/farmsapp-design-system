# Button/Spinner tokens: flat border, no Blade-style box-shadow bevel

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button (token prerequisites)

## Context

Blade's real `Button` fakes its border as a stack of inset `box-shadow`s (a top highlight line + a bottom shadow line + a real border color), producing a "glassy 3D" bevel effect — confirmed directly from Blade's real `boxShadow()`/`getBoxShadow()` source this session. This project has no visual precedent for that aesthetic (the brand direction so far is flat, snappy, utilitarian — see `project_brand_and_audience` memory), and the bevel technique is also structurally entangled with Blade's `hover`/`focus`/`active` box-shadow state resolution, which this project isn't adopting either (plain CSS pseudo-classes instead, see `decision-button-css-hand-written-not-generated.md`).

Separately, Blade's real `secondary`/`tertiary` variants (at `color="primary"`) both render as filled gray chrome — `surface.background.gray.intense`-equivalent — not a dimmed brand color. This project's existing `color.action.*` tokens only had one role (`primary`) before this chunk.

## Decision

**Flat, real `border-color`/`border-width`** for `tertiary` (this project's existing Box primitives), not Blade's stacked-shadow bevel. `primary`/`secondary` stay borderless (a real 1px `border-color: transparent` for layout stability across variants, per `button.css`).

**Six new tokens added to `semantic-color.json`/`semantic-color-dark.json`, under `color.action`**, matching Blade's real gray-chrome behavior for secondary/tertiary at the one supported color role (`primary`):

- `action.secondary` (`neutral.4`), `action.secondary-hover` (`neutral.5`), `action.secondary-active` (reuses hover — same "no dedicated pressed step, motion carries pressed feedback" convention as `action.primary-active`), `action.secondary-disabled` (reuses `action.primary-disabled`'s flattened-neutral treatment).
- `action.tertiary-hover` (`neutral.3`, one step lighter than secondary's fill — tertiary has no background at rest, transparent is a structural CSS value not a token), `action.tertiary-active` (reuses hover).

Tertiary's border reuses existing `color.border.default`/`color.border.subtle` tokens directly — no new border tokens needed.

## Consequences

- Verified: `pnpm --filter @farmsapp/tokens build` — 40/40 WCAG pairings still pass, all 6 new custom properties (`--ds-color-action-secondary*`, `--ds-color-action-tertiary-*`) resolve correctly in both themes in the real generated `tokens.css`.
- `Button`'s `tertiary` variant reads visually lighter-weight than `secondary` (border only vs. filled gray), a real, deliberate differentiation this project is choosing — Blade's own real tokens don't actually differentiate secondary/tertiary backgrounds at all (both point to the same gray-intense value); this project's flat-border choice creates a visual distinction Blade doesn't have, which is a reasonable and common convention (filled vs. outlined) rather than a literal port.
