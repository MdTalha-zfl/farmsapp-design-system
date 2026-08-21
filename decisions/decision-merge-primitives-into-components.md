# Merge packages/primitives into packages/components

- Status: accepted
- Date: 2026-08-21
- Context: pre-Phase 5, before any real primitive/component code existed

## Context

`packages/primitives` (Box, Stack, Inline, Container, Text, Heading, Icon, VisuallyHidden) and `packages/components` (Button, Input, Dialog, Menu, and the rest) were scaffolded as separate packages back in Phase 1, with `components` depending on `primitives` via `workspace:*`. This mirrors a common design-system pattern: low-level, rarely-changing layout/typography building blocks in one package, higher-level interactive components in another, so the two can version independently and the dependency direction (components → primitives, never the reverse) is enforced by the package boundary itself rather than convention.

The user asked to merge them into a single package before any real component code was written.

## Decision

Merged `packages/primitives` into `packages/components`. `packages/components` now covers the full range, from `Box`/`Stack`/`Text` through `Button`/`Dialog`/`Menu`. `packages/primitives` is deleted. `@farmsapp/design-system` (the re-export meta-package) now depends only on `@farmsapp/components`.

Made with essentially zero migration cost: both packages were still placeholder scaffolding (a version-constant export each), so this was a pure structural change — package.json/dependency edits, no component logic to move.

## What separate packages would have bought, given up here

- **Enforced layering.** With everything in one package, nothing at the package-boundary level stops a future `Box` implementation from importing something from `Button` — the one-way dependency direction becomes a convention to remember, not a structural guarantee. Worth being deliberate about in code review as the component count grows.
- **Independent versioning.** A Button interaction fix and a Box API change will now always ship in the same package version. `@farmsapp/design-system` already gives consumers a single install regardless, so the consumer-facing convenience case for separate packages was weak to begin with — this cost is mostly an internal/semver-precision one.

## Consequences

- `packages/components/package.json` now depends directly on `@farmsapp/tokens` (previously only `@farmsapp/primitives` did, transitively) and `@farmsapp/utilities`.
- The Phase 5 roadmap artifact and its chunk plan target `packages/components` instead of `packages/primitives` — the chunk breakdown (Box first, then compositions, then typography, then small a11y/icon primitives, then verification) is unchanged, since it was never actually about package boundaries, only build order.
- If the "components churns much faster than primitives" cost turns out to matter in practice once Phase 6+ actually starts shipping interactive components, re-splitting is possible later — nothing about this merge is one-way in principle, though by then there will be real code to migrate, unlike this time.
