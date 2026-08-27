# Text's `size` scoped per `variant`; `weight` forced to `regular` on captions

- Status: accepted
- Date: 2026-08-27
- Context: Phase 5 (Primitives), Chunk 04 — Text, following a real trace of Blade's own `Text` component the user asked to match

## Context

`decisions/decision-text-size-prop.md` shipped `size` as one flat 6-value scale (`xsmall`-`2xlarge`), usable with either `variant`. The user then supplied a full trace of Blade's real `Text` implementation and asked to stick to it. Blade's `Text` does not treat `size` as flat — it's a discriminated union: `variant="body"` accepts `xsmall | small | medium | large`, `variant="caption"` accepts only `small | medium` (its own two smallest steps), enforced both at the TypeScript level (a generic conditional type resolving `size`'s union from the literal `variant` passed at the call site) and at runtime (`getTextProps` throws in dev on a mismatched combo, falls back to a fixed value in prod). Blade also unconditionally forces `weight` to `regular` whenever `variant="caption"`.

## Decision — adopted

**`size` is now scoped per variant**, translated onto our own token mapping rather than copying Blade's literal step names (our scale doesn't share Blade's numbers): `variant="body"` keeps the full `BaseTextSizes` range (`xsmall`-`2xlarge`); `variant="caption"` is restricted to `CaptionTextSize = Extract<BaseTextSizes, "xsmall" | "small">` — its own base size (`xsmall`, 12px, matching `text.caption`'s own composite) and one step up (`small`, 14px, matching `text.body-sm`). A caption at `2xlarge` (24px, `text.heading-lg`'s own size) stops reading as a caption at all — the same semantic reasoning Blade's own restriction encodes, even though the specific reachable steps differ because the underlying scales differ.

**`weight` is forced to `regular` on captions**, matching Blade's behavior exactly: captions in this design system are never bold, full stop.

**Enforced at both levels, like Blade, via different mechanisms:**
- **TypeScript**: `TextOwnProps` is no longer one flat interface — it's `TextBodyOwnProps | TextCaptionOwnProps`, a real discriminated union on `variant`. `TextCaptionOwnProps.size` is typed `CaptionTextSize`; its `weight` is typed `never` (present, not omitted, so passing any real value is a compile error rather than a value that silently does nothing). `variant="caption" size="2xlarge"` is now a compile-time error, the same guarantee Blade's own type gives.
- **Runtime**: a dev-only `console.warn` + the override is simply skipped (not applied), falling back to the variant's own default. This is a defense-in-depth backstop for non-TypeScript callers only — real TypeScript callers are already blocked at the call site.

## Decision — deliberately NOT adopted

**Blade's generic `<T extends {variant: TextVariant}>` + `forwardRef`-erasure workaround.** Blade's own docs explain this generic exists purely to preserve the discriminated union through `forwardRef`'s generic-erasing signature. It doesn't apply here: `Text` already dropped every trace of the forwardRef-then-cast pattern once `as` became a closed 8-tag union (`decisions/decision-text-as-tag-and-variant-narrowed.md` — "no forwardRef-then-cast machinery needed... no per-call-site element type to keep narrow"). Verified directly rather than assumed: a plain (non-generic) union prop type, `TextBodyOwnProps | TextCaptionOwnProps`, checked cleanly against real playground usage, including a `TEXT_VARIANTS.map((v) => <Text variant={v}>...)` loop where `v: "body" | "caption"` — TypeScript correctly distributes a union-valued discriminant property across a union of object types at the JSX-attribute-checking boundary, without needing any of Blade's extra machinery. The only real compile error surfaced was the one that should surface: the gallery's own former `variant="caption" size="xlarge"` demo, now correctly rejected.

**Blade's dev-throw-with-prod-fallback.** Every other runtime guard in this codebase (the Devanagari letterSpacing guard, `warnIfInvalidStep` for any invalid token value) warns in dev and gracefully degrades — never throws. Introducing a throw here would make this the one validator in the whole design system with a different failure mode from every other one, for no benefit TypeScript hasn't already provided (TypeScript already blocks the mismatch at the call site for any real caller; the runtime path only exists for non-TypeScript callers, where a hard throw is a worse failure mode than a warned, silently-corrected value in a farmer-facing app).

**Blade's always-forced color default (`surface.text.gray.normal`).** Already a deliberate, documented divergence (`decisions/decision-text-heading-own-typography-props.md`'s "Update" section) — `color` stays unset-by-default so ordinary CSS inheritance still works, which the gallery's root wrapper depends on for its dark-mode legibility mechanism. Restated here because it's directly adjacent to this change, not because anything new changed about it.

**Everything platform-split (`BaseText.native.tsx`), analytics attributes, `assignWithoutSideEffects`, `elementtiming`, the RN `numberOfLines` branch.** Out of scope — this design system targets web only (Vite playground + Next.js docs), has no React Native surface, and `Box`'s own atomic-CSS class mechanism already gives Text everything `getStyledProps`/`useStyledProps` exist to provide in Blade's stack (styled-components CSSObject merging). Re-deriving Blade's whole style-engine layering here would duplicate what `Box`/`atomicConfig.mjs` already do for this codebase's actual (much simpler, build-time-generated, single-platform) architecture.

## Consequences

- `TextOwnProps` is now a union (`TextBodyOwnProps | TextCaptionOwnProps`), both branches exported from `@farmsapp/design-system` alongside the union itself, matching Blade's own practice of exporting both variant shapes (`TextBodyVariant`/`TextCaptionVariant`).
- One real playground migration: the earlier `variant="caption" size="xlarge"` cascade-order demo no longer compiles (correctly) — replaced with a valid `variant="caption" size="small"` demo (still proves the override, within caption's real range) plus two new "bypass the type guard, check console" demos (matching this project's existing convention for guarded/corrected props) proving the runtime backstop fires for both the size and weight guards.
- Full fresh `turbo run build lint typecheck --force` verified after this change, including a real rebuild of `@farmsapp/design-system`'s `build/index.d.ts` before rechecking the playground — the exact stale-build trap this project's own `LEARNING.md` already documents once (removing `color` from `BoxOwnProps` without rebuilding first showed zero errors where real errors existed).
