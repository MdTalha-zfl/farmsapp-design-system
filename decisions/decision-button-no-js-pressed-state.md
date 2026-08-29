# Button: pure CSS `:active` instead of Blade's JS `isPressed` state

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button

## Context

Blade's real `BaseButton` tracks press state in JS (`const [isPressed, setIsPressed] = React.useState(false)`, wired to `onMouseDown`/`onMouseUp`/`onTouchStart`/`onTouchEnd`/keyboard handlers), then feeds it into a `styled(BaseBox)` wrapper (`AnimatedButtonContent`) that applies `transform: scale(isPressed ? 0.95 : 1)`. Blade's own real source confirms this exists **specifically for React Native parity** — RN has no `:active` CSS pseudo-class, so press feedback has to be tracked in JS there, and the web implementation reuses the same mechanism rather than maintaining two.

## Decision

**Pure CSS**, no JS state at all:

```css
.ds-button:active { transform: scale(0.97); }
```

This project is web-only (repeatedly reaffirmed all session) — there's no React Native parity requirement pulling in a JS-tracked press state. Native `:active` already fires correctly for mouse, touch, **and** keyboard Enter/Space activation on a real `<button>` element — a JS `isPressed` boolean would buy nothing extra here, just React state, effect wiring, and event-handler plumbing for a purely visual effect CSS already handles natively.

## Consequences

- No `AnimatedButtonContent`-equivalent wrapper component, no `useState`, no mouse/touch/keyboard event handlers wired solely for press-scale.
- **Real, disclosed testing limitation**: Playwright's synthetic `mouse.down()`/`mouse.up()` (via CDP) does not reliably engage the browser's real `:active` pseudo-class state — confirmed directly via a control test against a completely plain, unstyled native `<button>` (`el.matches(':active')` returned `false` throughout a held `mouse.down()`, with zero Button-specific CSS involved). This is a known characteristic of automated input dispatch, not a bug in this project's CSS or component. `:hover` and `:focus-visible` (structurally identical selector-writing pattern, in the same file) were both independently confirmed working correctly with real waits/real keyboard `Tab` — giving high confidence `:active` works identically, even though it couldn't be mechanically proven the same way in this session.
