# Heading gains `weight`/`textDecorationLine`/`wordBreak`/`textAlign`/`textTransform`; Text gains `textAlign`/`textTransform`

- Status: accepted
- Date: 2026-08-27
- Context: Phase 5 (Primitives), Chunk 04 — Heading, following a real trace of Blade's own `Heading` component the user asked to match (companion to `decisions/decision-text-size-scoped-to-variant.md`, the same treatment applied to Text)

## Context

Blade's real `Heading` (traced directly, not assumed) shares `BaseText`'s full style engine with `Text`, `Display`, and `Code` — meaning it independently exposes `weight`, `textDecorationLine`, `wordBreak`, `textAlign`, `textTransform`, and (via a `size` prop) its own font-size scale. Our `Heading` had none of these — only `level`, `variant`, `letterSpacing`, `lang`, `color`. Comparing surfaced three real, separately-decided questions (asked directly rather than assumed, since one of them reverses a previously-reasoned decision):

## Decision — adopted

**`weight`, `textDecorationLine`, `wordBreak`, `textAlign`, `textTransform` all added to `Heading`.** `textAlign`/`textTransform` also added to `Text`, which was missing them too (a real gap from the earlier Text pass — Blade's own Text prop reference already listed them, and it was missed). Since all five props now apply identically to both components, the resolution logic was extracted out of `Text.tsx` into a new shared `resolveExtraTypographyClasses()` in `resolveTypographyClasses.ts` (alongside the existing shared `resolveTypographyClasses()` for variant/letterSpacing/color) — avoiding hand-duplicating the same five `if (x !== undefined) { warn; push class }` blocks in two files, the same "derive/share, don't hand-duplicate" discipline this file's own variant resolution already follows.

`textAlign` is a closed union of the four real CSS keywords (`left | center | right | justify`); `textTransform` similarly (`none | capitalize | uppercase | lowercase`) rather than Blade's own loose `CSSProperties['textTransform']` typing — the same "closed union over raw string" correction `wordBreak` already got in an earlier pass.

`atomicConfig.mjs`'s `TEXT_KEYWORD_PROPS` gained `textAlign`/`textTransform` entries (8 new base CSS rules — 4 values each). No token/generator changes needed beyond that: `generate-atomic-css.mjs`'s existing `TEXT_KEYWORD_PROPS` loop is fully generic and picked up both new entries automatically.

**`weight` stays optional with no forced default on `Heading`** — a deliberate, real deviation from Blade, not an oversight. Blade's `getHeadingProps` always resolves `fontWeight: weight ?? 'semibold'`, because Blade's `Heading` has no separate `variant`-driven weight to defer to (Blade's heading sizing/weight comes entirely from its `size` prop, resolved fresh every time). Ours is different: `variant`'s own composite `text.*` token already supplies a real, size-appropriate default weight — `bold` for `display`, `semibold` for `heading-lg`/`heading-md`/`heading-sm` (see `semantic-typography.json`). Forcing a `"semibold"` default the way Blade does would silently downgrade `display`'s own bold weight to semibold on every render that doesn't explicitly pass `weight` — a real, silent visual regression. So `Heading`'s `weight` behaves exactly like `Text`'s own `weight`: optional, no default, only applied as a standalone override when a call site explicitly sets it.

## Decision — deliberately NOT adopted

**Blade's `size` prop (`small | medium | large | xlarge | 2xlarge`) replacing/augmenting `variant`.** Blade's `Heading` has no `variant` at all — `size` alone drives both the visual scale and (via a real, hand-coded mapping) a sensible default rendered tag, with `as` available to override just the tag when needed. Explicitly considered and rejected: this project's `Heading` already made a deliberate, reasoned accessibility decision (`decisions/decision-heading-level-variant-decoupled.md`) that `level` (the real tag, document-structure-relevant) and `variant` (the visual size) must both be stated explicitly, with zero implicit mapping between them — because picking a smaller tag purely to get a smaller look is a common, real misuse worth making impossible. Blade's size-drives-a-default-tag model is a legitimate, different trade-off (more ergonomic, no page ever needs two props for a heading) — not a case where Blade's real source reveals our own reasoning was wrong, unlike the earlier Box/Text color split. Kept `level`+`variant` exactly as they were; `Heading` gained no `size` prop in this pass.

**A distinct heading typeface (`fontFamily: "heading"`).** Blade's `Heading` renders in a different font family from `Text` (their comments describe a variable font with a dedicated "Display" optical-size instance, forced via `fontVariationSettings`). This project's tokens only define `fontFamily.body` — headings currently render in the same typeface as everything else. Adding a second typeface is a real brand/font-loading/Devanagari-coverage decision on its own (the same category of decision as the already-made font-loading-deferred call, `decisions/decision-font-loading-deferred-to-later-chunk.md`), not something to fold in as a side effect of a props comparison. Headings keep using `fontFamily.body` for now.

**Blade's always-forced `color` default.** Same reasoning already documented for Text (`decisions/decision-text-heading-own-typography-props.md`, `decisions/decision-text-size-scoped-to-variant.md`) — `color` stays unset-by-default on `Heading` too, preserving CSS inheritance.

## A real bug found and fixed along the way, unrelated to this change

While re-reading `Text.tsx` before this edit, `color?: TextColor` had gone missing from its prop types entirely (destructured and used at runtime, but not declared on either `TextBodyOwnProps` or `TextCaptionOwnProps`) — `<Text color="primary">`, used throughout the gallery, would not have typechecked. Restored as part of this same edit. Also restored: `TextBodyOwnProps`/`TextCaptionOwnProps` naming (had been shortened to `TextBodyProps`/`TextCaptionProps`, inconsistent with every other primitive's `*OwnProps` convention in this package), and `TEXT_SIZES`'s gallery demo array (had lost `xlarge`/`2xlarge`, narrowing the demo below what `BaseTextSizes` actually supports).

## Update — `children` restricted to `string`, matching Blade's real `BaseText` split

Following up once the user pointed at Blade's own `_decisions/decisions.md` reasoning for `BaseText`: `BaseText` is Blade's internal, unpublished renderer that `Text`/`Heading`/`Display`/`Code` all share, with `Text` accepting `ReactNode` children (so a call site can nest a bold word or inline `Code` mid-sentence) while `Heading`/`Display` restrict children to `string` — deliberately, so a heading's typography stays uniform and can't be broken by an accidentally-nested element. Two of `BaseText`'s three stated purposes were already effectively present in this codebase without the name: `Box` already is the one shared low-level primitive `Text` and `Heading` both render through, and `resolveTypographyClasses()`/`resolveExtraTypographyClasses()` already are this project's `getTextProps`/`getHeadingProps` — one centralized curated-prop-to-CSS-class translation layer. The third purpose (children restriction as the composition boundary) was a genuine, undecided gap: `Heading`'s `children` was plain `ReactNode`, same as `Text`'s, with no restriction ever considered.

**Decision:** `HeadingOwnProps.children` is now `children: string` (required), matching Blade exactly. `Text.children` stays `ReactNode` (unchanged — it already flows through `ComponentPropsWithoutRef<"span">`, unrestricted). No new `BaseText`-equivalent component was introduced — `Box` continues to serve that role; only the missing constraint was added.

**Verified, not assumed:** every existing `Heading` usage in `apps/playground`'s gallery already passed a plain string child, so no migration was needed — confirmed via a real `tsc --noEmit` pass (clean) rather than assuming from a visual scan. A throwaway probe (`<Heading level="1" variant="display"><Text>nested</Text></Heading>`, deleted after) confirmed the restriction is actually enforced: `error TS2745: This JSX tag's 'children' prop expects type 'string'...`.

## Consequences

- `Heading` grew from 5 own props to 10; `Text` grew `textAlign`/`textTransform` on top of its existing surface.
- `resolveExtraTypographyClasses()` is now the one place `weight`/`textDecorationLine`/`wordBreak`/`textAlign`/`textTransform` resolve to class names for both components — `size`'s own caption-scoping logic stays in `Text.tsx` only, since `Heading` has no `size` prop to scope.
- 296 base CSS rules now (was 288), 35 props total (was 33).
- `apps/playground`'s gallery gained full demo coverage for every new prop on both components, including a `display` + no-weight-override row specifically proving `display` keeps its own bold default rather than silently downgrading to Blade's forced semibold.
- Full fresh `turbo run build lint typecheck --force` verified after this change.
