# When a component uses `<Box>` vs. a native element + its own CSS

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — generalized from the Badge/Spinner/Button/IconButton margin-props discussion

## Context

Worked out across several rounds of the same question, first asked about `Badge`, then generalized: why do `Stack`/`Inline`/`Container`/`Text`/`Heading` render through `Box`, while `Button`/`IconButton`/`Spinner`/`Badge` render a native element with their own hand-written CSS (`decisions/decision-button-css-hand-written-not-generated.md`), even after all 4 of the latter gained a real, consumer-facing `MarginProps` surface (`decisions/decision-margin-props-shared-across-components.md`)?

A real correction happened mid-discussion: Blade's actual `Badge.tsx` (pasted directly) renders through `BaseBox` as JSX repeatedly — not just for consumer margin passthrough, but for its own internal flex-row layout and icon wrapper too. This isn't evidence that this project should mirror that structure, though — it's evidence that Blade's `BaseBox` and this project's `Box` are architecturally different things wearing the same name. Blade's `BaseBox` is a `styled-components` component resolving **every** prop to a CSS object at **render time** (`useMemoizedStyles`) — it's Blade's *only* styling mechanism, which is why it shows up everywhere, including places with zero real per-instance variation. This project's `Box` resolves a **fixed, closed** set of props to **pre-generated, build-time** class names (`decisions/decision-box-atomic-css-over-inline-styles.md`) — a structurally different tool, built specifically to avoid the runtime cost Blade's own approach has (a real, cited Blade perf regression, PR #1009, fixed after the fact with memoization this project's design avoids needing at all).

## Decision

**Four-question test, in order, for any new component:**

1. **Is the root tag interactive/semantic** (`button`, `a`, `input`)? → Native element, always — `Box`'s own `ALLOWED_AS_TAGS` excludes these outright, not a judgment call.
2. **Does the component's own visual identity come from a closed, small set of enum props** (`color`/`size`/`emphasis`/`variant`/`shape`), fully known at author time, not open per-instance composition? → Native element + a hand-written, fixed CSS file in the `components` cascade layer. Box's prop-resolution loop has nothing real to resolve here; running it anyway is pure per-render overhead (an extra `forwardRef` boundary, a dev-mode tag check, an `Object.entries` pass) for values that never vary — a real cost at high instance counts (a badge/spinner rendered many times in a list/table).
3. **Within case 2, does the component also need a specific, real slice of Box's own resolvable props** (margin today, the only one with a cited need — `decisions/decision-margin-props-shared-across-components.md`)? → Call `resolveBoxClassNames` directly on that slice and fold the result into the component's own class list. Do **not** wrap the whole component in `<Box>` for this — that would re-derive the same classes through an extra layer of indirection, and would additionally inherit `Box`'s own permissive unrecognized-prop-to-DOM passthrough, silently loosening a closed component's prop surface for a non-TypeScript caller.
4. **Otherwise — the component's actual purpose is letting the caller compose arbitrary layout** (`Stack`/`Inline`/`Container`/`Text`/`Heading`)? → Render through `<Box as="...">`, or extend `BoxOwnProps` and spread into it. This is the case Box was built for.

## Consequences

- `Button`, `IconButton`, `Spinner`, `Badge` all land in case 2 (+3 for margin) — confirmed consistent across all four, not decided ad hoc per component.
- `VisuallyHidden` is case 2 without even the margin exception — no `MarginProps`, by design (`decisions/decision-visually-hidden-minimal-scope.md`'s closed scope; Blade's own real `VisuallyHidden` has no `StyledPropsBlade` either).
- A future component (`Alert`, `Chip`, `Tooltip`, ...) should run this same 4-question test explicitly rather than defaulting to whichever pattern the most recently-built sibling used — the test is the actual rule, not "look at what Button did."
