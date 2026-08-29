# Spinner wraps @farmsapp/icons' LoaderCircleIcon instead of hand-authored SVG

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button's `isLoading` prerequisite

## Context

Blade's real `Button` swaps in its own `BaseSpinner` component during `isLoading`. This project has no Spinner yet — same situation Icon/VisuallyHidden were in before Button needed them, pulled in now as an explicit, minimal prerequisite (see the Phase 7 plan). Before hand-authoring new spinner SVG, `packages/icons/scripts/icon-list.mjs` was checked directly: `LoaderCircleIcon` (Lucide's `loader-circle`, an open-arc glyph) was already generated as part of the Icon chunk's 8-icon list — added there specifically as "an async-loading spinner" use case, but never consumed until now.

## Decision

**`Spinner` wraps the existing `LoaderCircleIcon` from `@farmsapp/icons`** and adds a CSS rotation animation (`spinner.css`, `@layer components`, `750ms linear infinite`), rather than hand-authoring new SVG or a new icon-generation entry. `LoaderCircleIcon` itself stays `aria-hidden="true"` (hardcoded, unconditional, per `decision-icon-aria-hidden-unconditional.md`) — it's decorative; `Spinner`'s own `role="status"` + required `accessibilityLabel` (→ `aria-label`) carries the real accessible name.

This adds a genuine new package dependency: `@farmsapp/design-system` → `@farmsapp/icons` (`packages/design-system/package.json`'s `dependencies`). `turbo.json`'s existing `dependsOn: ["^build"]` already orders `icons`' build before `design-system`'s once this edge exists — no `turbo.json` change needed, confirmed by a real `turbo run build` (icons built before design-system in the task graph).

## Consequences

- No new SVG asset, no new icon-generation-pipeline entry — `Spinner.tsx` is ~10 lines, `spinner.css` is the only genuinely new surface.
- `prefers-reduced-motion: reduce` genuinely stops the rotation (verified in a real browser via CDP emulation) — a perpetually-spinning element is exactly the category that media feature exists for.
- Real gap, explicitly not silently dropped: this project has no `LiveAnnouncer`/`announce()` utility, unlike Blade's real `usePrevious` + `announce()` on every `isLoading` transition. `role="status"` covers "a spinner appeared, something is loading" for a screen reader already tracking the region, but does not reproduce Blade's exact "Started loading"/"Stopped loading" verbal announcements when `isLoading` flips on an already-mounted Button. See `decision-button-defers-live-announcer.md`.
- Verified in a real browser, both themes: `Spinner`'s icon color (unset, inheriting `currentColor`) correctly resolves to each theme's real `--ds-color-text-primary` value; `role="status"`/`aria-label="Loading"` resolves via `getByRole("status", { name: "Loading" })`; the inner `<svg>` stays `aria-hidden="true"`.
