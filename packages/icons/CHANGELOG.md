# @farmsapp/icons

## 0.2.0

### Minor Changes

- b4258bd: Add Toast (`<Toaster />`, `toast`, `useToast`) — an imperative toast queue with `neutral`/`info`/`success`/`warning`/`danger` intents, an optional single action, `update`-in-place by id, an `onDismiss` reason (`timeout`/`user`/`action`/`api`), at most 3 visible with the rest queued, and configurable placement (default bottom-center on phones, bottom-start from 600px). The queue is a framework-free module singleton, so `toast.show()` works outside React. Every non-neutral intent is a solid, full-strength background (no border) with inverse text and icon — `info` reuses the brand color, since there's no dedicated info hue — so each is unmistakable at a glance, including info versus neutral, which previously looked identical. Presentation is otherwise CSS-only (`transform`/`opacity`, no measured heights, so Devanagari and long strings wrap instead of clipping), with `prefers-reduced-motion` support, always-mounted `status`/`alert` live regions, and the existing `zIndex.toast` token. The countdown pauses while the pointer (mouse only, so a touch tap can't stick it) or keyboard focus is on a toast, or while the tab is hidden, and resumes with the remaining time. Escape dismisses the toast that has focus, and a closing toast is `inert`. Adds `InfoIcon` to `@farmsapp/icons`.
- 6b39ad0: Add `ChevronLeftIcon`.
- 70d66a7: Add CounterInput (now at `components/Input/CounterInput`, alongside the other Input family members) — a numeric stepper with a `−` button, an editable integer field, and a `+` button. Typing is a draft, parsed and clamped to `[min, max]` on blur or Enter; an empty field is a real `null` state, not `min`. The buttons and arrow keys step by `step`, PageUp/PageDown by `pageStep`, and Home/End jump to the bounds. Adds `PlusIcon` to `@farmsapp/icons` for its `+` button.
- 96cb016: Add `ChevronRightIcon`.

### Patch Changes

- Updated dependencies [6b39ad0]
- Updated dependencies [e66367f]
  - @farmsapp/tokens@0.2.0

## 0.1.0

### Minor Changes

- 1248912: Initial release: design tokens, utility hooks, icons, and core component library (Box, Input, Button, Badge, Divider and more)

### Patch Changes

- Updated dependencies [1248912]
  - @farmsapp/tokens@0.1.0
