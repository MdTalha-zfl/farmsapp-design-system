# Icon `size`/`color` reuse existing tokens — no dedicated Blade-style scale

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon

## Context

Blade's real `Icon` has a dedicated primitive pixel scale (`xsmall:8px … 2xlarge:32px`, 6 steps) and a separate `icon.*` color tree (`interactive.icon.*`/`surface.icon.*`/`feedback.icon.*`, mirroring but distinct from text colors). This project already deferred Blade's richer interactive-state color model (`default/highlighted/disabled/faded/ghost` per role) as premature — nothing here needs it yet, confirmed directly when comparing `bladeTheme.ts`'s real structure against this project's own, much flatter `semantic-color.json`.

## Decision

**Size: 3 named steps, not 6, mapped onto real, already-existing `@farmsapp/tokens` spacing steps — no new pixel values invented.**

| `size` | px | Spacing step reused |
|---|---|---|
| `small` | 16px | `space.2` |
| `medium` (default) | 24px | `space.3` |
| `large` | 32px | `space.4` |

`medium` (24px) is deliberately the default — it's Lucide's own native viewBox size, so the common case renders at 1:1 scale with zero scaling. `small` (16px) lines up with `body-md`'s own font-size, covering the "icon inline with text" case. 3 steps, not 6: this project's spacing scale genuinely doesn't have enough distinct sub-16px steps to support more without duplicating values — 3 is the honest number this token scale supports, not an arbitrary trim.

This doesn't contradict `decisions/decision-component-breakpoint-scale.md`'s "give a primitive its own dedicated scale when justified" precedent (real precedent for the opposite call, checked directly rather than ignored): that scale needed new *values* — `breakpoint.component`'s own numbers (600/1024) genuinely differ from `breakpoint.consumer`/`breakpoint.portal`. Icon size needs new *names* over values the spacing scale *already contains, unmodified* — a dedicated scale is justified when the numbers themselves must differ; a named alias is enough when they don't.

**Color: `IconColor` reuses `TextColor`'s exact 7 values** (`primary | secondary | disabled | inverse | danger | warning | success`) — declared as its own local type in `resolveIconProps.ts` rather than imported from `@farmsapp/design-system` (see `decisions/decision-icon-css-own-package.md` for why `packages/icons` doesn't depend on `design-system`'s internals). A small, disclosed, by-hand-kept-in-sync duplication — 7 rarely-changing string literals, not a growing scale, so the duplication risk is low.

## Consequences

- `packages/icons/src/icon.css` defines `.ds-icon-size-{small,medium,large}` and `.ds-icon-color-{primary,secondary,disabled,inverse,danger,warning,success}`, referencing `@farmsapp/tokens`'s real custom properties directly.
- Verified in a real browser, both themes: all 3 sizes compute their exact expected pixel value; all colors compute correctly and flip correctly between light/dark; an icon's inner `<path>` stroke resolves through `currentColor` to match the `<svg>`'s own computed `color` exactly, confirming no per-path styling is needed.
