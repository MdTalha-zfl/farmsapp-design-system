# Button icon-only accessible naming: required `accessibilityLabel` -> `aria-label`

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button, resolving the deferral in `decision-icon-aria-hidden-unconditional.md`

## Context

`decision-icon-aria-hidden-unconditional.md` deliberately deferred "how does an icon-only interactive element get an accessible name" to whenever Button was actually planned. Blade's real trace (gathered this session) confirmed: `IconButton` uses a required `accessibilityLabel` prop mapped directly to `aria-label` — not `VisuallyHidden`. Blade's real `Button.tsx`/`BaseButton.tsx` source (pasted directly this session) confirms `Button` shares the identical mechanism: `accessibilityProps={{ label: accessibilityLabel, ... }}`, resolved through `makeAccessible()` to `aria-label`.

## Decision

**Match Blade exactly.** `accessibilityLabel` is a real prop on `Button`; when `icon` is present and `children` is absent/empty (`isIconOnly`), it's applied as `aria-label` on the rendered element.

**Enforcement is two-layer**, matching this project's own established pattern (Text.tsx's caption-prop guards):
1. **TypeScript**: the discriminated union (`ButtonWithChildrenOwnProps` vs. `ButtonIconOnlyOwnProps`) makes `accessibilityLabel` **required** specifically on the icon-only shape — a real compile-time signal for the common case.
2. **Runtime dev-warn** (inline during render, never `useEffect`, per `decision-no-useeffect-dev-warnings.md`): if `isIconOnly && !accessibilityLabel` (reachable via a non-TypeScript caller or a type-bypass), `console.warn` and still render — this project's established "never throw" divergence from Blade's `throwBladeError`.

**Worth noting explicitly**: Blade itself does *not* actually type-enforce this — its own `accessibilityLabel` stays optional even in the icon-only-shaped case (Blade's `ButtonWithIconProps` doesn't require it). Requiring it here is a deliberate strengthening beyond a literal Blade port, not an oversight in either direction.

## Consequences

- Verified in a real browser: `getByRole("button", { name: "<accessibilityLabel>" })` (or `"link"` for the `href` case) resolves via the real accessibility tree for every icon-only Button in the gallery.
- No `VisuallyHidden` usage anywhere in `Button`/`BaseButton` — consistent with the Icon/IconButton precedent already established.
