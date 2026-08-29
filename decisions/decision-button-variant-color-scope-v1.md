# Button v1: 3 variants, no `color` prop yet

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button

## Context

Blade's real `Button` supports `variant: 'primary' | 'secondary' | 'tertiary'` crossed with `color: 'primary' | 'white' | 'positive' | 'negative'` (and `BaseButton` internally supports even more: `notice | information | neutral | transparent`), each resolving through a real `interactive.background/border/text/icon.<role>.*` token tree. This project's own `semantic-color.json` had exactly one `action.*` role (`primary`) before this chunk — confirmed directly, not assumed, before any code was written.

## Decision

**v1 ships `variant` only** (`primary | secondary | tertiary`) — **no `color` prop at all**, not even accepted-and-ignored. `variant="secondary"`/`"tertiary"` render as gray chrome (new `action.secondary*`/`action.tertiary-*` tokens, see `decisions/decision-button-flat-border-not-bevel.md`), matching Blade's own real behavior that secondary/tertiary don't carry brand color at `color="primary"` anyway.

This matches the project's repeated "don't build tokens ahead of a real consumer" discipline (already applied to Icon's size scale, this project's flat `action.*` token before this chunk, etc.). A future `color` prop (positive/negative/white) is additive, not a breaking change, once something real needs a destructive/on-dark button.

## Consequences

- `ButtonVariant` type is a closed 3-value union; adding `color` later means a new prop, new tokens, and new `button.css` selectors (e.g. `.ds-button--variant-primary.ds-button--color-negative`), but no restructuring of what's already shipped.
- Verified: all 3 variants render with correct, theme-aware colors in both light/dark, at rest/hover/active/focus-visible, in a real browser.
