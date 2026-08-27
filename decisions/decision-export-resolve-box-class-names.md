# `resolveBoxClassNames` exported — the `makeBoxProps` seam, ready ahead of a real consumer

- Status: accepted
- Date: 2026-08-27
- Context: Phase 5 (Primitives), following the Box.tsx Blade comparison

## Context

Blade's `Box.tsx` exports `makeBoxProps` specifically so other components can reuse its whitelist/prop-resolution logic without rendering through `Box` itself — necessary because Blade's `validBoxAsValues` (like this project's `ALLOWED_AS_TAGS`) deliberately excludes interactive/semantic elements from `as`. A future `Button` can never be `<Box as="button">` in either system, so any interactive component that wants the same style-prop surface (`padding`, `margin`, ...) needs a way to resolve those props to real styling on its own render tree.

This project's equivalent, `resolveBoxClassNames` (`Box.tsx`), was module-private — no current component uses it except `Box` itself, and there was no seam for a future one to reuse it without duplicating the logic.

## Decision

**Exported `resolveBoxClassNames` from `Box.tsx`.** Zero behavior change — the function itself is untouched, only the `export` keyword was added. Kept its existing name (not renamed to match Blade's `makeBoxProps`) since it does something narrower and more specific than Blade's version: it returns an array of class name strings, not a filtered *props* object — a name like `makeBoxProps` would misdescribe what it actually returns.

**Deliberately not re-exported from `index.tsx`** (the public package barrel). This is a seam for *sibling components within `@farmsapp/design-system`* (Phase 7's `Button`/`Input`, once built, living in the same package and able to `import { resolveBoxClassNames } from "../Box/Box"` directly, the same way `Stack`/`Inline`/`Container`/`Text`/`Heading` already import `BoxOwnProps` today) — not yet a commitment to external consumers as a documented public API. That's a separate, larger decision for whenever a real external need shows up, consistent with this project's repeated pattern of not committing to speculative public surface (the dotted `textDecorationLine` value, `wordBreak`'s closed union, the base-reset's deliberately minimal scope) — this export is the cheap, internal half of that same restraint, not an exception to it.

## Consequences

- No behavior change; verified via a full fresh `turbo run build lint typecheck --force`.
- Whenever Phase 7's first interactive component needs Box-style layout props on its own element, `resolveBoxClassNames` is ready to import directly — no duplicated whitelist logic, no re-deriving the same prop-to-class-name resolution a second time.
