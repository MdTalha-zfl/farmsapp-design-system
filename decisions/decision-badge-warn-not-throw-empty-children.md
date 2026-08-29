# Badge empty/whitespace children: warn-and-degrade, not throw

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Badge

## Context

Blade's real `Badge.tsx` throws in dev (`throwBladeError`) when `children` is empty or whitespace-only, and its own `_decisions/decisions.md` records a resolved design call: no icon-only badges, text is always required. This project has an established, repeated divergence from Blade's `throwBladeError` pattern — `decisions/decision-no-useeffect-dev-warnings.md`, `decisions/decision-iconbutton-dev-warn-not-throw.md`, and the runtime layer of `decisions/decision-button-icon-only-accessible-name.md` all warn-and-degrade instead of throwing.

## Decision

**Keep Blade's underlying rule** (text children required, no icon-only Badge — there's no accessible-name mechanism on Badge the way there is on Button/IconButton, so an icon-only Badge would have no accessible name at all) **but enforce it this project's own way, not Blade's:**

1. **TypeScript**: `children: string` required in the props type — a real compile-time signal for the common case.
2. **Runtime dev-warn** (inline during render, never `useEffect`, per `decision-no-useeffect-dev-warnings.md`): if `children` is empty/whitespace at runtime (reachable via a non-TypeScript caller or a type-bypass), `console.warn` and render nothing/an empty shell rather than throwing.

## Consequences

- No error boundary needed anywhere Badge is used — an invalid empty-children Badge degrades to an empty (if useless) element instead of crashing the tree, consistent with every other dev-time guard already shipped in this codebase.
- Icon-only Badge remains unsupported, matching Blade's own resolved decision — this is agreement with Blade on the underlying rule, divergence only on what happens when the rule is violated.
