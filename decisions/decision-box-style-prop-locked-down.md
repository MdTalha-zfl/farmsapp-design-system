# Box no longer accepts a plain `style` prop — locked down to match Blade's stated rationale

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), raised while comparing `atomicConfig.mjs` against Razorpay Blade's real `BaseBox` implementation

## Context

Box's `style` prop (inherited unfiltered from the underlying DOM element's own type, via `Omit<ComponentPropsWithoutRef<T>, keyof BoxOwnProps | "as">` never excluding it) let any caller pass an arbitrary inline style alongside Box's own token-driven props. Because inline styles always win over a class selector on CSS specificity, this meant a caller's `style` prop could silently override any of Box's own computed spacing/color/radius classes — the padding you set with `padding="4"` could be quietly cancelled by a `style={{ padding: 0 }}` passed alongside it, with no warning, and no way to tell from Box's own props alone that this happened.

A research pass into Blade's real source (dispatched to compare `atomicConfig.mjs` against Blade's actual `BaseBox` implementation) turned up that Blade already made this exact call, deliberately: `BaseBox` exposes no `className`/`style` prop at all, and Blade's own RFC (`rfcs/2023-01-06-layout.md`) states the reason plainly: *"a padding property on CSS can mess up the built-in spacing on a component."* Same risk, same component category, independently arrived at.

## Decision

`Box` no longer accepts `style`. `BoxProps<T>` explicitly excludes it from the underlying element's inherited prop type (`Omit<..., keyof BoxOwnProps | "as" | "style">`), so a caller passing `style` gets a real compile error, not just an unenforced convention. As defense against a non-TypeScript caller or a type-bypass reaching the same path, `Box`'s own resolver also drops any `style` prop that does arrive at runtime, with a dev-mode `console.warn` — the same pattern already used for the `as` allowlist warning.

`className` is **not** locked down the same way — kept exactly as it was, merged additively after Box's own computed classes (`[...boxClasses, className].filter(Boolean).join(" ")`). A class can add rules but a class alone can't retroactively cancel one of Box's own declarations the way an inline style can; the asymmetric risk is specific to `style`, not to any external styling mechanism at all.

**The real complication, found only once every current Box consumer was checked, not assumed away:** `Container.tsx` already depended on passing `style` straight through Box for its `maxWidth` mechanism (`decision-container-maxwidth-scale.md`) — a legitimate, previously-verified, first-party use of exactly the capability now being removed. A blanket removal breaks Container's own file identically to blocking an external app, since TypeScript has no notion of "this file gets more trust than that one" for the same exported type.

Resolved by giving `Box` a second, deliberately differently-named prop, `unsafeStyle?: CSSProperties` — real, typed, and functionally identical to the old `style`, but named to signal it is not part of Box's public contract. `Stack`/`Inline`/`Container`'s own `OwnProps` interfaces explicitly `Omit<BoxOwnProps, "unsafeStyle">` (in addition to now also excluding `"style"` from their own inherited-element prop type) so that extending `BoxOwnProps` wholesale doesn't silently re-leak the escape hatch to app callers through a different prop name — `unsafeStyle` is reachable only as a literal JSX attribute inside a first-party primitive's own render function (as `Container.tsx` does for its `maxWidth`/`width: 100%` styles), never as a prop `Stack`/`Inline`/`Container` themselves expose.

## Consequences

- `apps/playground`'s Box variant gallery had 19 call sites passing `style` purely for demo-sizing purposes (fixed swatch widths/heights for visual comparison, `maxWidth`/`overflow`/`flex-shrink` for layout scaffolding). All 19 were migrated to a real stylesheet (`apps/playground/src/demo.css`) plus Box's still-supported `className` prop — the pattern a real consuming app should already be using for anything outside Box's token surface, now the *only* pattern available for it. Re-verified with a real browser (`playwright-core`/Edge): swatch dimensions, `margin=auto` centering symmetry, the inverse-color swatch's resolved background, and root-level max-width centering all matched pre-migration behavior; zero stray `"style" prop dropped` dev warnings anywhere in the gallery.
- Any future Box-derived primitive (`Text`, `Heading`, Phase 5 Chunk 04) that needs a raw CSS escape hatch for its own internal composition should reach for `unsafeStyle` the same way `Container` does — not re-derive a different mechanism.
- If a real, recurring app need for arbitrary inline styling on `Box` shows up later (not yet observed), the right response is almost always "add the missing prop to `atomicConfig.mjs`" (extending Box's real, token-backed surface) rather than reopening `style` — the entire point of this decision is that a one-off inline override is exactly the failure mode Box's atomic-class model exists to prevent.
