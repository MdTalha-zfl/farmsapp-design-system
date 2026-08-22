# Box validates color/radius/borderWidth prop values against real token steps at runtime, dev-mode only

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), surfaced while verifying whether Blade's `Box`/`Card` boundary claim ("Box is non-visual") held up against real source

## Context

Checking that claim against Blade's actual code turned up something unrelated but concrete: Blade's public `Box` component (narrower than the internal `BaseBox`) runs a dev-mode validator, `validateBackgroundString`, that throws when `backgroundColor` receives a value outside the real token set — a genuine runtime guarantee, not just a TypeScript-level restriction.

Our own `Box`'s color/radius/border-width props (`backgroundColor`, `borderColor`, `color`, `borderRadius`, `borderWidth`) are restricted to closed TypeScript unions (`SurfaceColor`, `BorderColor`, `TextColor`, `Radius`, `BorderWidth`) but have no runtime check at all. For a fully TypeScript-compliant caller this doesn't matter — the type system already blocks an invalid value before it ever runs. It matters for anything the type system can't see: a non-TypeScript consumer, a value computed dynamically from an untyped source (an API response, a CMS field), or a plain `as any`/`as string` bypass. In any of those cases, an invalid value silently reaches `atomicClassName(cfg.prefix, value)`, producing a class name string with **no matching rule** in the generated `build/css/atomic.css` — the element renders with that class in its `className` attribute and nothing visibly happens, no error, no warning. This is the exact failure shape as the `RESPONSIVE_PROP_KEYS` bug found earlier the same day, just reached through a different door (an unchecked value instead of a stale key list).

## Decision

Added `warnIfInvalidTokenValue` to `Box.tsx` — a dev-mode-only check, run for every prop backed by `TOKEN_COLOR_PROPS`/`TOKEN_SCALE_PROPS` specifically (not spacing or keyword props — out of scope for this decision), comparing the incoming value against the real, current token step list and `console.warn`-ing if it isn't there.

**Warn, not throw** — a deliberate divergence from Blade's own equivalent, not an oversight. Every other dev-mode guard already in this file (`warnIfDisallowedTag` for `as`, the dropped-`style`-prop warning) warns rather than throws; introducing a throw here specifically would make this one guard behave differently from its neighbors for no reason tied to this particular prop group. Consistency within this file's own established pattern won out over matching Blade's exact behavior.

**The valid step lists are derived, not hand-listed a second time.** `scripts/generate-atomic-css.mjs` already computes `scaleSteps`/`colorSteps` from `@farmsapp/tokens`' real JSON source to build the CSS itself — the same build run now also writes those exact objects out to a new generated module, `src/generatedValidSteps.mjs`, gitignored like `packages/tokens/src/generated/tokens.ts` already is, with a hand-authored, committed `generatedValidSteps.d.mts` declaring its shape (same pairing convention as `atomicConfig.mjs`/`atomicConfig.d.mts`). `Box.tsx` imports and checks against this generated list. Hand-listing a second copy of these step names directly in `Box.tsx` would have reintroduced the identical "two copies of the same list, one goes stale" bug class fixed earlier the same day (`decisions/decision-box-prop-names-vs-class-prefixes.md`'s "Follow-on bug" section) — deriving it instead makes that impossible here.

## Consequences

- Verified with a throwaway probe (`react-dom/server` `renderToString`, deleted after): a deliberately invalid `backgroundColor="crimson"` (a type-bypass, simulating a non-TypeScript caller) produces exactly one `console.warn`; a valid `backgroundColor="raised"` produces zero. Full fresh `turbo run build lint typecheck --force`, 19/19.
- If a future Box-derived primitive adds its own `TOKEN_COLOR_PROPS`/`TOKEN_SCALE_PROPS`-style category, this guard covers it automatically — no per-prop wiring needed, since it reads `cfg.varCategory` off the same shared `PROP_CONFIG` map every other resolver behavior already goes through.
- Deliberately scoped to color/radius/border-width only, matching what was actually decided — spacing (`SPACE_PROPS`) and keyword (`KEYWORD_PROPS`) props have no equivalent runtime guard yet. Worth revisiting only if a real gap shows up there too, not speculatively extended now.
