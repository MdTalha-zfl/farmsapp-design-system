# Heading: `level` and `variant` are both required and independent — no `as`, no implicit mapping

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 04 — Text, Heading

## Context

Every other primitive in this package (`Box`, `Stack`, `Inline`, `Container`, `Text`) is polymorphic via `as`, using the forwardRef-then-cast pattern from `rca/rca-box-polymorphic-props-lost-type-safety.md`. `Heading` raised a real question `as` alone can't answer cleanly: should the prop that picks the rendered tag (`h1`-`h6`, real document structure, accessibility-relevant) also be the thing that picks the visual size? Real accessibility guidance says no — heading hierarchy should reflect document structure, not the size a designer wants a given piece of text to look; conflating the two is a common, real misuse (picking `h3` over `h2` purely to get a smaller-looking heading, silently breaking the page's outline for screen-reader users).

## Decision

Two separate required props: `level: "1" | "2" | "3" | "4" | "5" | "6"` picks the real rendered tag; `variant: "display" | "heading-lg" | "heading-md" | "heading-sm"` picks the visual style. No default for either, and deliberately no implicit mapping between them (e.g., `level="1"` does not default `variant` to `"display"`) — there's no real design-intent basis to guess that mapping from, and guessing one risks it being silently wrong for real content that doesn't happen to follow the "level 1 = biggest visual size" assumption.

**Both required, not optional with a default**, for the same reason Stack/Inline's `gap` is required (`decisions/decision-box-atomic-css-over-inline-styles.md`'s Chunk 03 companion reasoning): an unset heading level has no safe fallback — defaulting to `h1` would be wrong most of the time (typically one per page), and any other default is just as arbitrary. Making it required turns a silent, easy-to-miss omission into a compile error.

**No `as` prop at all — a deliberate divergence from every other primitive in this package.** Allowing `as` to also override the rendered tag would let it silently win over `level`, undoing the exact separation this decision exists to create; there can only be one authoritative source for which tag renders. A real, incidental benefit: since `HeadingProps` carries no type parameter, `Heading` needs none of the forwardRef-then-cast machinery every other primitive requires — there's no per-call-site element type to preserve, so a plain `forwardRef<HTMLHeadingElement, HeadingProps>` is sufficient and correctly type-safe on its own.

## Consequences

- Verified with `@ts-expect-error` (a throwaway typecheck probe, deleted after): `<Heading variant="display" />` and `<Heading level="1" />` both genuinely fail to compile — confirming both props are actually enforced as required, not just documented as such.
- Verified in a real browser: `<Heading level="2" variant="display">` renders a real `<h2>` tag (confirmed via `tagName`) at the `display` variant's real computed font-size (`36px`, matching `fontSize.900`) — and, for contrast, `<Heading level="1" variant="heading-sm">` renders a real `<h1>` at `18px` (`fontSize.500`). Both the tag and the visual size are independently correct, proving the decoupling works in practice, not just at the type level.
- A real, incidental bug this surfaced and fixed: `Box`'s own `ALLOWED_AS_TAGS` dev-mode allowlist didn't include `h1`-`h6` at all, so every single `Heading` render was triggering Box's "disallowed tag" warning — caught by the same `renderToString` probe used to verify the letter-spacing guard, not assumed. Fixed by adding `h1`-`h6` to the allowlist, since `Heading` is now exactly the "dedicated component" the warning's own message asks callers to use instead of raw `<Box as="...">`.
