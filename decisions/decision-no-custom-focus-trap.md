# No hand-rolled useFocusTrap — Floating UI's FloatingFocusManager covers it

- Status: accepted
- Date: 2026-08-21
- Context: Phase 5 (Primitives) roadmap, Chunk 01 planning

## Context

The Phase 5 roadmap originally listed `useFocusTrap` as a Chunk 01 utility hook, flagged as a genuine build-vs-reuse question (mature implementations exist in Radix UI/react-aria, but hand-rolling keeps the dependency surface minimal, matching this project's build-vs-buy posture elsewhere — Rollup over tsup, a hand-written OKLCH generator over a color library).

That framing missed something already decided earlier in this project: `@floating-ui/react` was committed to early on, specifically for Dialog/Menu/Popover positioning. Its React package ships `FloatingFocusManager`, which handles focus trapping — plus initial focus and focus return on close — for exactly the floating/overlay components that need it.

## Decision

No `useFocusTrap` hook in `packages/utilities`. Removed from the Phase 5 roadmap entirely, not deferred as a "build later" item.

Two separate reasons stack here, not one:
1. **Redundant work.** Every component that will need focus trapping (Dialog, Menu, Popover — all inherently "floating" elements) will already be using Floating UI for positioning. Building a second focus-trap implementation solves a problem the already-chosen dependency solves.
2. **Wrong phase, not just wrong tool.** Nothing in Phase 5 itself (`Box`, `Stack`, `Text`, `VisuallyHidden`, `Icon`) is an overlay or needs focus containment. The original framing ("built now because it's a utility, and utilities land in this phase") justified building it *early*, not building it *at all* — that reasoning doesn't hold once the actual need only exists in Phase 7-8, alongside components that will already depend on Floating UI.

## Consequences

- Focus management work moves to whenever Dialog/Menu/Popover get built (Phase 7-8), sourced from `@floating-ui/react`'s `FloatingFocusManager`, not a custom hook.
- `useControllableState` stays in Chunk 01 — no equivalent arrives via any already-committed dependency, so hand-rolling it is still the right call, unlike `useFocusTrap`.
- General lesson worth repeating for the rest of this phase's utility hooks: check what's already been committed to as a dependency *before* framing something as a build-vs-reuse comparison — the comparison was already resolved once, earlier in the project, and re-litigating it from scratch in the roadmap almost shipped a duplicate.
