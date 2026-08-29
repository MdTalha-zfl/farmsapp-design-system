# Box — React Native support, chunk 2

- Status: accepted, verified on a real device
- Date: 2026-08-29
- Context: Phase 7 — cross-platform support, chunk 2 (Badge was chunk 1)

## Context

Direct follow-on to `decisions/decision-badge-react-native-support-chunk-1.md` — same session, same conventions, no new environment problems to discover: `native-playground`'s `metro.config.js` `resolveRequest` fix (React version resolution) and the `@farmsapp/tokens` unitless-dimension fix both already existed and applied to this chunk for free.

## Decision

**`Box/Box.native.tsx`** — reuses `Box.tsx`'s own exported types (`SpaceStep`, `MarginStep`, `SurfaceColor`, `BorderColor`, `Radius`, `BorderWidth`) so the *shape* of the API stays identical between platforms — same prop names, same token-step values — only the resolution mechanism differs: web resolves a prop to a class name string; native resolves the same prop directly to a `View` `style` object value, using `@farmsapp/tokens`' flat JS constants (now unitless numbers, per the chunk-1 fix).

**Revised same day**: the first draft hand-declared `BoxNativeOwnProps` field-by-field and hand-unrolled a 20+ branch if-chain to resolve each one — real, user-flagged duplication of `atomicConfig.mjs`'s existing prop config (`SPACE_PROPS`/`KEYWORD_PROPS`/`TOKEN_COLOR_PROPS`/`TOKEN_SCALE_PROPS`), the same config `Box.tsx`/`generate-atomic-css.mjs` already use for web. Rewritten to import that config directly and resolve generically — the exact "one config, both platforms just render it differently" shape Blade's own `BaseBox` already has (one `theme` object; styled-components CSS for web, RN style objects for native). Concretely:
- `BoxNativeOwnProps` is now derived via a mapped type over `BoxOwnProps` (`PickNative<K> = { [P in K]?: NativeValue<BoxOwnProps[P]> }`, stripping the `Responsive<T>` wrapper) instead of retyping every field by hand — `display`/`backgroundColor` are still explicitly overridden (real, deliberate platform narrowing, not something to derive mechanically).
- `resolveNativeStyle` iterates the incoming props with `Object.entries`, looks each key up in `atomicConfig.mjs`'s own config objects, and resolves generically — the same shape as `Box.tsx`'s own `resolveBoxClassNames`. A prop added to `atomicConfig.mjs` for web is automatically picked up here too (once its token category has a native value table), rather than needing a second, hand-written branch.
- `atomicConfig.mjs`'s `KEYWORD_PROPS` value maps (e.g. `alignItems`: `start` → `flex-start`) are reused as-is for native — confirmed directly that CSS and RN's Yoga layout engine happen to use identical final keyword values for these, not assumed.
- The one genuinely new piece with no web equivalent, kept as its own small table: `TOKEN_VALUES`, mapping each `varCategory` (`atomicConfig.mjs`'s own category names: `"radius"`, `"border-width"`, `"color-border"`, `"color-surface"`) to real resolved values — this is unavoidable, not duplication: web defers this resolution to the browser via `var(--ds-*)`; native has no CSS engine to defer to, so it needs the actual value at JS runtime. `RN_KEY_OVERRIDES` covers the 4 cases (`paddingX`/`paddingY`/`marginX`/`marginY`) where a mechanical CSS-property→RN-style-key camelCase conversion doesn't hold (CSS has no single property for "horizontal padding"; RN does, `paddingHorizontal`) — everywhere else the RN style key is derived by camelCasing `atomicConfig.mjs`'s own `cssProps[0]`, not hand-listed a second time.
- Re-verified pixel-identical to the pre-refactor screenshot on the same Android emulator — the generic resolver produces byte-for-byte the same style values as the hand-unrolled version it replaced.

**Deliberately reduced scope, each disclosed, not an oversight:**
- No `Responsive<T>` support — native has no `@media` equivalent; a real responsive story needs a different mechanism (`useWindowDimensions`-driven, most likely), not attempted here.
- No `as` prop — React Native has no semantic-HTML-element concept; `Box.native` always renders a plain `View`, matching Blade's own real `BaseBox` on native (also always a `View`).
- `backgroundColor="overlay"` unsupported — `@farmsapp/tokens`' `ColorSurfaceOverlay` is a CSS `color-mix()` value (confirmed by reading the actual generated constant), which has no React Native equivalent — RN style values must be a real, static color string. Dev-warns and drops the background rather than crashing, same "warn and degrade" convention as everywhere else in this codebase.
- No `unsafeStyle` escape hatch — the web version's reason for existing (a Box-derived primitive needing a raw CSS property Box doesn't expose) doesn't map cleanly onto RN's plain-object style model; revisit only if a real native consumer needs it.
- `display` only accepts RN's real values (`"flex"`/`"none"`) — web-only values (`"block"`, `"inline"`, `"grid"`, `"contents"`, `"inline-flex"`) are excluded at the type level rather than silently mapped to something wrong.

**Real, mechanical TypeScript fixes needed, worth recording since they'll recur for every future `*.native.tsx` component:**
- React Native's `ViewStyle` type marks its own properties as effectively write-once for consumers building a style object incrementally (assignment errors, not a real runtime restriction) — worked around with a local `MutableViewStyle` mapped type (`{ -readonly [K in keyof ViewStyle]: ViewStyle[K] }`), used only for the local builder object, cast back to `ViewStyle` at the point it's actually passed to `<View style={...}>`.
- `forwardRef<View, ...>` doesn't typecheck against RN's real `View` component types in this RN version — fixed with `ElementRef<typeof View>` (from `"react"`) instead of the class name directly.

## Consequences

- Verified via real screenshot on the actual Android emulator (same `native-playground` app, same emulator, no new environment setup needed): `padding`/`backgroundColor`/`borderColor`/`borderWidth`/`borderRadius` render correctly on a real card; a `flexDirection="row"` + `gap` layout correctly spaces two pill-shaped (`borderRadius="full"`) children; `justifyContent="between"` correctly pushes a `Text` and a nested `Badge` to opposite ends of a row — confirming `Box.native` and `Badge.native` compose correctly together, not just individually.
- `src/index.native.tsx` now exports both `Badge` and `Box` (plus Box's shared type exports) — `Stack`/`Inline`/`Container`/`Text`/`Heading`/`Button`/`IconButton`/`Spinner` remain unported, each gets its own future chunk.
- The `MutableViewStyle` pattern and the `ElementRef<typeof View>` ref-typing fix are now a proven, reusable template for every future `*.native.tsx` component that builds a style object incrementally — won't need rediscovering.
