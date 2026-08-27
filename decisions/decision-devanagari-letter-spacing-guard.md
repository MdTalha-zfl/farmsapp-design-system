# Explicit `lang` prop + a real, enforced guard against Devanagari + letter-spacing

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 04 — Text, Heading

## Context

Token Foundation Chunk 04 already flagged the underlying risk: Latin-style letter-spacing (tracking) can visually break how Devanagari glyphs join together, so `letterSpacing.tight`/`.wide` are documented as Latin-script-only. That was a documentation-level warning; Chunk 04 needed a real mechanism, since `Text`/`Heading` are the first components that actually apply these tokens.

Three real options for how a component would know whether it's rendering Devanagari content:
1. An explicit prop (`lang`), set per instance by the caller.
2. Auto-detection — sniff the actual rendered text content for Devanagari Unicode ranges.
3. No automatic behavior at all — letter-spacing tokens never apply unless the caller explicitly opts in, sidestepping detection entirely.

## Decision

**Explicit `lang` prop** (option 1), narrowed to `"en" | "hi"` rather than an open BCP-47 string — matching this project's actual, stated scope (India-focused, Hindi/Devanagari support specifically) rather than building a general multi-language API surface nothing yet needs. Auto-detection (option 2) was rejected: fragile for mixed-script or dynamically-composed content, and adds a real per-render text-scanning cost specifically after Box's own resolver was rebuilt earlier this same day to avoid exactly that class of cost (`decision-box-atomic-css-over-inline-styles.md`).

`lang` does double duty deliberately — it both drives the internal letter-spacing decision *and* gets set as the real HTML `lang` attribute on the rendered element, a genuine accessibility win (screen readers use it for correct pronunciation) as a side effect of reusing real HTML semantics, not an internal-only flag invented for this one purpose.

**letterSpacing defaults to `"normal"` always** (closest to option 3, layered on top of option 1): tight/wide tracking is never applied implicitly by `variant` — a caller has to explicitly request `letterSpacing="tight"` to get it at all. This means the dangerous combination (Devanagari content + tracking) can only happen if a caller does two things wrong at once (sets `letterSpacing` explicitly *and* fails to set `lang="hi"`), not one.

**A real, enforced guard, not just a documentation warning:** if `letterSpacing` is `"tight"` or `"wide"` while `lang="hi"`, the shared resolver (`src/components/Box/resolveTypographyClasses.ts`) forces it back to `"normal"` and warns in dev mode — matching the `warnIfInvalidTokenValue`/dropped-`style`-prop pattern already established the same day. The unsafe combination is structurally prevented from ever reaching the DOM, not just flagged after the fact.

## Consequences

- Verified for real, twice: a real browser check (`playwright-core`/Edge) confirmed the computed `letter-spacing` for a `lang="hi"` + `letterSpacing="tight"` case resolves to `"normal"` (vs. a genuine Latin tight-tracking case computing to `-0.16px`, the real `-0.01em` token value at a 16px base) — proving the guard changes the *applied* CSS, not just logs a warning. A `react-dom/server` `renderToString` probe (`NODE_ENV=development`, deleted after) confirmed the warning fires exactly for the two unsafe combinations tested (`tight`+`hi`, `wide`+`hi`) and not for the two safe ones (`hi` alone with default `letterSpacing`, `tight` alone with no `lang`).
- `TypographyLang` (`"en" | "hi"`) is intentionally narrow — extending to more Devanagari-script languages (Marathi, Nepali, Sanskrit) or other scripts entirely is a real future need but not this project's current stated scope; extend the union when a real need shows up rather than speculatively now.
- This guard lives in the one shared resolver both `Text` and `Heading` call — see `decisions/decision-text-heading-own-typography-props.md` for why that resolver exists as shared code rather than being duplicated into both components.
