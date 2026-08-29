# Button/Spinner defer Blade's LiveAnnouncer — role="status" is the smaller substitute

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button's `isLoading` prerequisite (Spinner)

## Context

Blade's real `BaseButton` announces loading-state transitions to assistive tech explicitly, via a real `usePrevious`/`useEffect` pair calling `announce("Started loading")`/`announce("Stopped loading")` on every `isLoading` flip (confirmed directly from Blade's real source, `BaseButton.tsx`). `announce()` is Blade's own `LiveAnnouncer` utility — a dedicated ARIA live-region manager. This project has no equivalent utility anywhere in `packages/utilities` or `packages/design-system`.

## Decision

**Deferred, not silently dropped.** `Spinner` (see `decision-spinner-reuses-loadercircleicon.md`) uses a plain native `role="status"` on its own wrapping `<span>`, with `aria-label` carrying the loading message. This is a real, smaller substitute:

- `role="status"` is a native ARIA live region (implicitly `aria-live="polite"`, `aria-atomic="true"`) — a screen reader already tracking the page will announce it once it exists in the DOM with real content.
- It does **not** reproduce Blade's exact behavior: a static `role="status"` region reliably announces when its *content changes*, not simply when the element mounts/unmounts — which is exactly how Button's `isLoading` toggles Spinner in and out of the DOM. Whether a screen reader announces "Loading" at all on a plain mount (vs. a text change inside an already-present live region) is inconsistent across screen reader/browser combinations — a real, known limitation of this approach, not a false equivalence.

No `LiveAnnouncer` utility is being built in this chunk. Building one is a real, non-trivial addition (a singleton or context-based live-region manager, debouncing, cleanup) that no other component in this codebase needs yet — matching this project's repeated "don't build ahead of a real, broader need" discipline.

## Consequences

- A real, documented accessibility gap: a screen-reader user may not reliably hear "Loading"/"Stopped loading" when a Button's `isLoading` toggles, especially on a fast toggle. Verified in this chunk only that the static case (Spinner mounted, `role="status"`/`aria-label="Loading"` present) is correctly exposed to the accessibility tree — the dynamic transition-announcement behavior was not verified, because the mechanism this project has doesn't attempt to guarantee it.
- Revisit if/when a component with a stronger real need for transition announcements comes up (a toast/notification system is the most likely first real consumer of a proper `LiveAnnouncer`) — at that point, build the utility once and have `Spinner`/`Button` adopt it, rather than building it speculatively now for a single, partial use case.
