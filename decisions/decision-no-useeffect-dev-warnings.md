# Dev-mode warnings stay inline during render — not moved to `useEffect`

- Status: accepted
- Date: 2026-08-27
- Context: Phase 5 (Primitives), following a real trace of Blade's `Box.tsx` architecture the user asked to compare against

## Context

Blade's `Box.tsx` validates `as` and `backgroundColor` inside `useEffect`, not inline during render. Ours calls `warnIfDisallowedTag`/`warnIfInvalidTokenValue` (`Box.tsx`) and `warnIfInvalidStep` (via `resolveTypographyClasses`/`resolveExtraTypographyClasses`, used by `Text`/`Heading`) directly in the render body. This is a real, testable difference, not just a style preference: React 18 `StrictMode` (already wrapping `apps/playground`'s root) intentionally double-invokes function-component render bodies in dev to surface side-effect bugs — a `console.warn` called inline during render is exactly that kind of side effect, while the same call inside `useEffect` only fires once per actual commit.

**Verified, not assumed:** every dev-warning check in this project up to this point used `renderToString` (a single render pass), which never exercises `StrictMode`'s double-invoke behavior at all — so this was never actually checked. A real `vite dev` server + a real browser (not `renderToString`) confirmed every existing dev warning genuinely fires twice: the Devanagari letterSpacing guard, the caption `weight`/`size` guards, and the `as="button"` tag guard (4x — two separate gallery demos triggering the same warning text, each doubled).

## Decision

**Left as-is — warnings stay inline during render, not moved to `useEffect`.** Considered directly, not defaulted to. The fix (wrapping every warning call in a `useEffect`) has two possible forms, both with a real cost:

1. **A plain `useEffect(() => { if (dev) warn(); }, [deps])`** — correct, matches Blade exactly, but the hook itself is unconditional: every `Box` render schedules and runs an effect, forever, in every build (development *and* production), purely to serve a dev-only convenience. `Box`'s own header comment explicitly frames it as a hot path ("cost scales with props actually passed") — adding a permanent per-render cost to avoid a dev-only cosmetic issue cuts against that.
2. **The same `useEffect`, but the whole call wrapped in a `NODE_ENV`-gated `if` block** — genuinely zero production cost (Vite dead-code-eliminates the entire branch in production builds, the same mechanism this project already relies on and has verified elsewhere for `console.warn` calls disappearing from prod builds). But a conditional hook call trips `react-hooks/rules-of-hooks` — the linter can't see that the branch disappears at build time — requiring an explicit `eslint-disable` comment at every call site.

Weighed against the actual severity: duplicate console warnings only ever happen in development, only under `StrictMode`, and only for genuinely invalid prop usage in the first place — most React developers already recognize `StrictMode`'s double-invoke as an expected, well-documented quirk, not a real bug. Not worth a permanent cost on `Box`'s explicitly-optimized render path, and not worth a `rules-of-hooks` lint-disable repeated across every warning call site in the codebase, for a cosmetic dev-console duplication.

## Consequences

- No code changed. `Box.tsx`, `resolveTypographyClasses.ts` keep calling their warning functions inline during render, exactly as before.
- If a real complaint about duplicate warnings ever surfaces from actual consumers (not hypothetically), revisit with option 2 (`NODE_ENV`-gated `useEffect` + lint-disable) — the zero-cost path, once there's a real reason to accept the lint-disable's small ongoing maintenance cost.
