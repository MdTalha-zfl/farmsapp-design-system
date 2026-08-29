# Icon prop resolution: plain function, not a hook — mirroring Text/Heading's own precedent

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon

## Context

Blade's real `Icon` resolves `size`/`color` via a `useIconProps({size, color})` hook that calls `useTheme()` internally to read `theme.colors` from React Context. This project's own `Text`/`Heading` already answered the analogous question for typography (`resolveTypographyClasses`, `resolveExtraTypographyClasses` — both plain functions, not hooks) — worth confirming the same reasoning transfers to `Icon` rather than assuming it does by pattern-matching alone.

## Decision

**`resolveIconClassName` (`packages/icons/src/resolveIconProps.ts`) is a plain function, not a hook.** It transfers directly: Blade's `useIconProps` is a hook *because* it needs `useTheme()` — a real, necessary React Context read at render time. This project's theming is 100% CSS custom properties + `[data-theme]`/`[data-brand]` attribute switching; no component anywhere in this codebase reads a theme value from JS at render time. A hook here would give `Icon` nothing a plain function call at the top of its own render body doesn't already have — it would just be React Hooks Rules overhead (a component identity concern, a lint-rule surface, a `use*` naming convention) for zero real benefit.

## Consequences

- `resolveIconClassName(size, color, className)` is called directly inside each generated icon's wrapper component body — no `useIconProps()`, no Context Provider dependency, no hook-order constraints.
- Consistent with `resolveTypographyClasses.ts`'s own established precedent — the same reasoning, re-confirmed rather than assumed, for a second, independent component family.
