# Text/Heading — React Native support via a new shared BaseText, chunk 3

- Status: accepted, verified on a real device
- Date: 2026-08-30
- Context: Phase 7 — cross-platform support, chunk 3 (Badge chunk 1, Box chunk 2)

## Context

User's own framing going in: "platform level bifurcation should happen in a new BaseText component" — matching Blade's real, confirmed architecture (`Typography/BaseText/BaseText.web.tsx` + `.native.tsx`) and this project's own established Button/BaseButton precedent (`decisions/decision-button-basebutton-split.md`), rather than repeating Badge/Box's pattern of two fully independent, parallel implementations with no shared component.

Before this chunk, `Text.tsx`/`Heading.tsx` were two independent thin wrappers sharing only resolver *functions* (`resolveTypographyClasses`/`resolveExtraTypographyClasses` in `Box/resolveTypographyClasses.ts`), not a shared *component*. Neither had a native counterpart.

## Decision

**New `BaseText/BaseText.tsx` (web)** — extracted the actual render logic both `Text.tsx` and `Heading.tsx` used to duplicate (resolve variant/letterSpacing/lang/color to classes, resolve weight/textDecorationLine/wordBreak/textAlign/textTransform, build the `truncateAfterLines` line-clamp style, render through `Box`) into one shared component. `Text.tsx`/`Heading.tsx` were refactored to delegate to it, keeping only what's genuinely exclusive to each: Text's discriminated, caption-scoped `size` prop; Heading's `level`→tag mapping. Not exported from `index.tsx` — internal to Text/Heading, the same shape as `BaseButton` relative to `Button`. Re-verified via the live Storybook instance (already running all session) picking up the refactor with no build errors — the extraction is behavior-preserving, not a rewrite.

**New `BaseText/BaseText.native.tsx`** — consumes `@farmsapp/tokens`' composite `Text*` objects (`TextBodyMd`, `TextDisplay`, `TextHeadingLg/Md/Sm`, `TextBodySm`, `TextCaption`) directly. Unlike Box/Badge, **no new per-field token value table was needed** — these objects already carry `fontFamily`/`fontSize`/`fontWeight`/`lineHeight`/`letterSpacing` as real, separate fields, because the token pipeline generates them that way for exactly this reason (web's own CSS output flattens the same data into one `font` shorthand string, which native has no way to consume — the underlying source data was already shaped right for native, it just wasn't being read that way before).

**`Text.native.tsx`/`Heading.native.tsx`** — thin wrappers mirroring their web counterparts' own split of responsibility, delegating to `BaseText.native`. `Text.native.tsx` computes its own `size`→font-size-override logic (`FontSizeXsmall`..`FontSize2xlarge` × a `BASE_FONT_SIZE = 16` matching `decisions/decision-rem-for-typography-px-for-layout.md`'s "assumed 16px root" the web rem values already use), passed to `BaseText.native` as a `fontSizeOverride` — `lineHeight` is recomputed from `variant`'s own ratio against the *overridden* size, matching how CSS's unitless line-height naturally recomputes against whatever font-size is actually in effect (not something Text's web version has to do explicitly, but a real, necessary step natively since RN's `lineHeight` is an absolute value, not a unitless multiplier).

**Deliberately reduced scope, each disclosed, not an oversight:**
- `fontFamily` passes through as the token's first font-stack entry ("Noto Sans") — the font itself isn't linked into `native-playground` yet (a real, separate, deferred concern, same category as this project's already-deferred font-subsetting item); falls back to the OS default font until a real native font-linking pass happens.
- `wordBreak` is unsupported on native — React Native's text-wrapping model has no direct equivalent to CSS `word-break`. Typed `never` on both `TextNativeProps`/`HeadingNativeProps` and dev-warns if a non-TypeScript caller passes it anyway, rather than guessing a mapping.
- `lang`'s Devanagari letterSpacing safety guard is kept (same check as web — forces `letterSpacing="normal"` when `lang="hi"`), but no real native attribute is set — React Native's accessibility-language signal (`accessibilityLanguage`) is a structurally different, separate API, not attempted here.
- `Heading`'s `level` prop is kept on `HeadingNativeProps` for API-shape parity with web but doesn't affect rendering — React Native has no semantic heading elements (`<h1>`-`<h6>`); a future accessibility pass could map it to `accessibilityRole="header"` + `accessibilityLevel`, not attempted in this first slice.
- `letterSpacing`'s em-like token value is converted to a real point value by scaling against the resolved font size (`letterSpacingEm * fontSizePx`) — React Native's `letterSpacing` style has no unitless/em concept the way CSS does.

**Real, mechanical TypeScript fixes needed, same category as `Box.native.tsx`'s own — added to the running list of patterns future `*.native.tsx` components can reuse directly:** React Native's `TextStyle` type has the same incremental-build restriction `ViewStyle` does — fixed with the same `MutableTextStyle` mapped-type pattern already established for `Box.native.tsx`.

## Consequences

- Verified via real screenshot on the actual Android emulator (same `native-playground` app): `Heading` at two different levels/variants/colors, `Text` with `weight`/`color` overrides, `Text`'s `size` prop overriding font-size independently of `variant`, `variant="caption"`, and `truncateAfterLines={1}` correctly clipping a long sentence with an ellipsis inside a nested `Box` — confirming `Text`/`Heading`/`Box`/`Badge` all compose correctly together on native, not just individually.
- `src/index.native.tsx` now exports `Badge`, `Box`, `Text`, and `Heading` — `Stack`/`Inline`/`Container`/`Button`/`IconButton`/`Spinner` remain unported, each still its own future chunk.
- Real environment flakiness hit and resolved during this chunk's own verification, unrelated to the code itself: the Android emulator entered a bad state (system-level "System UI isn't responding"/"Bluetooth keeps stopping" ANRs, a stuck bundle-reload with no error) partway through — diagnosed as an emulator health issue, not a code bug, by noticing the ANRs were on unrelated system apps, not `native-playground` itself. Resolved with a clean `-wipe-data` emulator restart rather than continuing to debug against an unhealthy instance.
- The `MutableTextStyle` pattern, the `fontSizeOverride`+recomputed-`lineHeight` approach for a standalone size override, and the `BaseText` web/native split itself are now a proven template for any future primitive with the same "shared base + platform-specific rendering" shape.
