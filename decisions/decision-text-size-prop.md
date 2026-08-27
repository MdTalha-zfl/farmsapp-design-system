# Text gains `size` — a named scale independent of `variant`

- Status: accepted
- Date: 2026-08-26
- Context: Phase 5 (Primitives), Chunk 04 — Text, requested directly by the user, as a follow-up to `decisions/decision-text-additional-props.md`

## Context

Requested as `BaseTextSizes = "xsmall" | "small" | "medium" | "large" | "xlarge" | "2xlarge"`, a fixed 6-step scale. `variant` (`"body" | "caption"`) already implies a font-size internally, via the composite `text.*` token's `font` shorthand (`decisions/decision-text-as-tag-and-variant-narrowed.md`) — so this is the same shape of question `weight` already answered: a real, standalone CSS property that needs to override one component of `variant`'s shorthand, not replace `variant` itself.

## Decision

**No new raw font-size values were invented.** `typography.json`'s primitive `fontSize` scale already has 9 steps (100-900, 12px-36px) and every existing `text.*` composite variant already picks one of them. Rather than adding new pixel values, `packages/tokens/tokens/semantic-typography.json` gained a new `fontSize` object aliasing 6 of those 9 primitives under the requested names:

| `size` | primitive step | px | matches |
|---|---|---|---|
| `xsmall` | `fontSize.100` | 12px | `text.caption` |
| `small` | `fontSize.300` | 14px | `text.body-sm` |
| `medium` | `fontSize.400` | 16px | `text.body-md` (Text's own default variant) |
| `large` | `fontSize.500` | 18px | `text.heading-sm` |
| `xlarge` | `fontSize.600` | 20px | `text.heading-md` |
| `2xlarge` | `fontSize.700` | 24px | `text.heading-lg` |

`fontSize.200` (13px) and `fontSize.800`/`900` (30px/36px) are deliberately left unaliased here — 200 has no existing variant anchor to justify a name, and 800/900 stay heading/display-exclusive territory: a `Text` this large reads as a real layout decision (should this be a `Heading` instead?), not a body-text sizing choice. Every named step lines up with a font-size some real `text.*` variant already uses, so `size="large"` on a `<Text>` and `heading-sm`'s own size are never two different numbers that happen to look similar — they're the same token.

Resolved exactly like `weight`: a new `TOKEN_TEXT_PROPS.size` entry (`{ cssProps: ["font-size"], prefix: "font-size", varCategory: "font-size" }`), reading real step names from `semanticTypography.fontSize` (not hand-listed) in `generate-atomic-css.mjs`. Declared *after* `weight` in `TOKEN_TEXT_PROPS`, so its generated CSS rule is later in stylesheet source order than `variant`'s — same cascade mechanism already verified for `weight` overriding `variant`'s own `font-weight` component (`decisions/decision-text-additional-props.md`'s "cascade-order" section) applies identically here for `font-size`.

Text-exclusive, not added to `Heading` — same reasoning as `weight`/`textDecorationLine`/`wordBreak`: nothing asked for it there, and `Heading`'s size already comes from its required `variant` prop, which has no safe default the way `Text`'s does.

## Consequences

- 288 base CSS rules now (was 282 — 6 new: 6 `fontSize` named steps), 33 props total (was 32).
- `apps/playground`'s gallery gained a `size` demo section covering all 6 values, plus one explicit `variant="caption" + size="xlarge"` case proving `size` overrides `variant`'s own font-size component rather than being silently overridden by it.
- Full fresh `turbo run build lint typecheck --force` verified after this change.
