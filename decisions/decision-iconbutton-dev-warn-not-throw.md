# IconButton's size="large" + isHighlighted/moderate guard: warn-and-degrade, not throw

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — IconButton

## Context

Blade's real `IconButton` has no `large` entry in its `highlightedButtonSizeMap` (`{ small: 24px, medium: 32px }`) and a real, confirmed dev-time guard: `if (size === 'large' && (isHighlighted || isModerate)) throwBladeError(...)`.

## Decision

**Warn and gracefully degrade instead of throwing** — this project's own established, repeatedly-applied divergence from Blade's `throwBladeError` (`decisions/decision-no-useeffect-dev-warnings.md` and every other dev-mode guard in this codebase). When `size === "large"` combined with `isHighlighted` or `emphasis === "moderate"`, `IconButton` logs a `console.warn` and renders as if no container were requested — the button falls back to hugging its icon's own intrinsic size (verified in a real browser: computed `width`/`height` both read `32px`, exactly `large`'s own icon size, confirming this is the icon's natural content size, not a half-applied container class).

## Consequences

- No error boundary needed to catch a thrown error from a bad prop combination — the invalid combination degrades to a visually reasonable (if not fully Blade-parity) result instead of crashing the tree.
- Verified in a real browser: the warning message fires (checked via a real `console` listener, not just reading the source), and `.ds-icon-button--has-container` is genuinely absent from the class list when the guard triggers.
