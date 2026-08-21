# Merge packages/components into packages/design-system

- Status: accepted
- Date: 2026-08-21
- Context: immediately following the primitives→components merge, before any real component code existed

## Context

`@farmsapp/design-system` was scoped from Phase 1 as a re-export-only meta-package — "re-exports the component library... for consumers who want a single install," depending only on `@farmsapp/components` (and, before the previous merge, `@farmsapp/primitives`). It never had, or was ever planned to have, real content of its own.

The moment `packages/primitives` merged into `packages/components` (`decisions/decision-merge-primitives-into-components.md`), `design-system`'s entire value proposition collapsed: a re-export layer that re-exports exactly one package adds nothing over depending on that package directly. It was never scoped to bundle `icons`/`themes`/`utilities`/`tokens` too — only components (and primitives).

## Decision

Merged `packages/components` into `packages/design-system`, keeping the `design-system` name as the survivor — confirmed by checking real dependents first: both `apps/docs` and `apps/playground` already depend on `@farmsapp/design-system`, never on `@farmsapp/components` directly, so this is also the zero-app-changes direction. `packages/components` is deleted. `@farmsapp/design-system` now has real dependencies (`@farmsapp/tokens`, `@farmsapp/utilities`) instead of just re-exporting another package, and its entry point moved from `.ts` to `.tsx` since real component code needs JSX.

Same zero-migration-cost situation as the prior merge: both packages were still placeholder scaffolding.

## Consequences

- There is now exactly one published package for the entire component surface: `@farmsapp/design-system`, covering `Box`/`Stack`/`Text`-level primitives (Phase 5) through `Button`/`Dialog`/`Menu`-level components (Phase 7+).
- `packages/tokens`, `packages/themes`, `packages/utilities`, and `packages/icons` remain separate — those have real, independent reasons to stay split (tokens/themes are consumed by non-React contexts too via the `./css` export; icons are a large, independently-tree-shakable set). This merge was specifically about the two packages that had collapsed into pure indirection, not a general "fewer packages" mandate.
- If a genuine need for granular installs shows up later (e.g. a consumer who wants layout primitives without pulling in every interactive component's bundle size), splitting is possible then — with real code to migrate at that point, unlike both of this session's merges.
