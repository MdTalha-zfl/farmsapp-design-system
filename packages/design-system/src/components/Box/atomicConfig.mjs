/**
 * Single source of truth for Box's style-prop surface — imported by BOTH
 * scripts/generate-atomic-css.mjs (Node, build time, produces the CSS) and
 * Box.tsx (produces the exact same class names at render time). Keeping one
 * config instead of two keeps the generated CSS and the component's
 * className resolver mechanically incapable of drifting apart.
 *
 * Deliberately NOT the full CSS surface — only what Stack/Inline/Container/
 * Text (Phase 5 Chunks 03-04) actually need. See
 * decisions/decision-box-atomic-css-over-inline-styles.md.
 *
 * `scale` names below must match a real @farmsapp/tokens category exactly —
 * generate-atomic-css.mjs reads the step lists from the token source, this
 * file never hand-lists step values, so a spacing-scale change can't
 * silently desync the generated CSS from what Box thinks is valid.
 */

export const SPACE_PROPS = {
  padding: { cssProps: ["padding"], prefix: "p" },
  paddingTop: { cssProps: ["padding-top"], prefix: "pt" },
  paddingRight: { cssProps: ["padding-right"], prefix: "pr" },
  paddingBottom: { cssProps: ["padding-bottom"], prefix: "pb" },
  paddingLeft: { cssProps: ["padding-left"], prefix: "pl" },
  paddingX: { cssProps: ["padding-left", "padding-right"], prefix: "px" },
  paddingY: { cssProps: ["padding-top", "padding-bottom"], prefix: "py" },
  margin: { cssProps: ["margin"], prefix: "m", allowAuto: true },
  marginTop: { cssProps: ["margin-top"], prefix: "mt", allowAuto: true },
  marginRight: { cssProps: ["margin-right"], prefix: "mr", allowAuto: true },
  marginBottom: { cssProps: ["margin-bottom"], prefix: "mb", allowAuto: true },
  marginLeft: { cssProps: ["margin-left"], prefix: "ml", allowAuto: true },
  marginX: { cssProps: ["margin-left", "margin-right"], prefix: "mx", allowAuto: true },
  marginY: { cssProps: ["margin-top", "margin-bottom"], prefix: "my", allowAuto: true },
  gap: { cssProps: ["gap"], prefix: "gap" },
  rowGap: { cssProps: ["row-gap"], prefix: "row-gap" },
  columnGap: { cssProps: ["column-gap"], prefix: "column-gap" },
};

// prop key -> fixed keyword list (no token scale — these are CSS keywords).
export const KEYWORD_PROPS = {
  display: {
    cssProps: ["display"],
    prefix: "display",
    values: ["none", "block", "inline", "inline-block", "flex", "inline-flex", "grid", "contents"],
  },
  flexDirection: {
    cssProps: ["flex-direction"],
    prefix: "flex-direction",
    values: ["row", "column", "row-reverse", "column-reverse"],
  },
  flexWrap: {
    cssProps: ["flex-wrap"],
    prefix: "flex-wrap",
    values: ["wrap", "nowrap", "wrap-reverse"],
  },
  alignItems: {
    cssProps: ["align-items"],
    prefix: "align-items",
    values: { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" },
  },
  justifyContent: {
    cssProps: ["justify-content"],
    prefix: "justify-content",
    values: {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      between: "space-between",
      around: "space-around",
      evenly: "space-evenly",
    },
  },
};

// prop key -> token scale category, resolved to a var() reference. `varCategory`
// is the CSS custom property name segment (--ds-{varCategory}-{step}).
export const TOKEN_COLOR_PROPS = {
  backgroundColor: { cssProps: ["background-color"], prefix: "bg", varCategory: "color-surface", tokenPath: ["color", "surface"] },
  // Deliberately NO extraDecl here (border-style: solid lives on borderWidth
  // only, below) — a first version put it on both, which fixed borderWidth
  // alone having zero effect but created a worse follow-on bug: borderColor
  // alone (no borderWidth) then got border-style: solid with no explicit
  // border-width, and the browser's default border-width ("medium", ~3px)
  // kicked in — a real, unwanted border. Caught by the same live browser
  // check this chunk's decision log commits every style-prop change to
  // (Box variant gallery, apps/playground). Matches Tailwind's own resolved
  // convention for the identical tension: setting only a border-color
  // utility has no visible effect without a border-width utility too — a
  // known, documented CSS behavior, not something to paper over from one
  // prop alone, since there's no single "right" implied width to guess.
  borderColor: { cssProps: ["border-color"], prefix: "border-color", varCategory: "color-border", tokenPath: ["color", "border"] },
  // `color` moved OUT to TOKEN_TEXT_PROPS below (2026-08-22, prompted by
  // checking Blade's real Box/Text color architecture) — Blade's BaseBox
  // has no text-color concept at all, only backgroundColor/borderColor;
  // text coloring is BaseText's exclusive concern, with its own
  // independent color type. See decisions/decision-text-heading-own-typography-props.md's
  // "Update" section.
};

export const TOKEN_SCALE_PROPS = {
  borderRadius: { cssProps: ["border-radius"], prefix: "radius", varCategory: "radius", tokenPath: ["radius"] },
  // extraDecl: border-width alone computes as 0 whenever border-style is its
  // own default (none) — a real CSS behavior, not implementation-specific.
  // Bundling border-style: solid here means borderWidth alone just works;
  // pair it with borderColor for anything but the default border color.
  borderWidth: { cssProps: ["border-width"], prefix: "border-width", varCategory: "border-width", tokenPath: ["borderWidth"], extraDecl: "border-style: solid;" },
};

// Text-exclusive props — Phase 5 Chunk 04 (Text/Heading). Deliberately a
// SEPARATE object from TOKEN_COLOR_PROPS/TOKEN_SCALE_PROPS, even though the
// generated-CSS shape is identical for two of these three (one CSS
// property, a direct var(--ds-{varCategory}-{step}) reference per step) —
// Box.tsx's PROP_CONFIG is built by iterating TOKEN_COLOR_PROPS/
// TOKEN_SCALE_PROPS directly, so merging these in would make Box's own
// resolver silently accept variant/letterSpacing/color even though none of
// them are part of BoxOwnProps' type. Text/Heading import this object
// directly and resolve their own class names from it (see
// resolveTypographyClasses.ts) rather than going through Box's resolver.
//
// `color` joined `variant`/`letterSpacing` here on 2026-08-22, moved out of
// TOKEN_COLOR_PROPS above — prompted by checking Blade's real Box/Text
// color architecture rather than assuming the original "Box and Text share
// one color type" design was validated by it. It wasn't: Blade's BaseBox
// has no text-color concept at all (only backgroundColor/borderColor);
// BaseText declares its own independent color type from scratch, with its
// own resolver, sharing nothing with Box except layout/spacing props. Text
// coloring is Text/Heading's exclusive concern here too now, matching
// variant/letterSpacing's existing reasoning — Box stays layout + purely
// structural visual styling (background, border, radius), never text
// color. See decisions/decision-text-heading-own-typography-props.md's
// "Update" section for the full reasoning and the migration this caused.
export const TOKEN_TEXT_PROPS = {
  // `text.*` composite tokens (packages/tokens/tokens/semantic-typography.json)
  // each compile to ONE self-contained CSS custom property via the `font`
  // shorthand (confirmed in the real generated CSS: `--ds-text-display: ...;`)
  // — so, unlike color/radius, there's no separate value lookup needed here,
  // just a prefix + the step name directly. Prefix is "font", NOT "text" —
  // `color` below already uses prefix "text" (generating
  // ds-text-primary/secondary/...) for an entirely different concept (text
  // COLOR, not variant). Caught before it shipped: with prefix "text" here
  // too, both props would share one class-name namespace (ds-text-*)
  // purely by coincidence of matching prefixes, with no collision that day
  // only because current step names (primary/secondary/disabled/inverse vs
  // display/heading-lg/...) didn't happen to overlap — exactly the kind of
  // "works by luck, not by construction" gap this project has caught and
  // fixed multiple times (RESPONSIVE_PROP_KEYS, the borderColor/borderWidth
  // border-style bundling). "font" matches the actual CSS property this
  // prop sets, and can't collide with "text".
  variant: { cssProps: ["font"], prefix: "font", varCategory: "text" },
  // letterSpacing intentionally excludes Box's own margin/padding-style
  // "auto" handling — it's a closed three-value scale (tight/normal/wide),
  // not a spacing step.
  letterSpacing: { cssProps: ["letter-spacing"], prefix: "letter-spacing", varCategory: "letter-spacing" },
  // Same shape/prefix/varCategory as when this lived in TOKEN_COLOR_PROPS —
  // only which object owns it changed, not how it resolves or what class
  // name it emits (ds-text-primary etc., unchanged, so no gallery visual
  // regression from the move itself).
  color: { cssProps: ["color"], prefix: "text", varCategory: "color-text", tokenPath: ["color", "text"] },
  // Real primitive scale (typography.json's fontWeight: regular/medium/
  // semibold/bold), same direct var() shape as variant/letterSpacing —
  // shared by Text AND Heading (both resolve it through
  // resolveExtraTypographyClasses in resolveTypographyClasses.ts). Neither
  // component defaults it: variant's own composite font shorthand already
  // supplies a real per-size weight (bold for display, semibold for
  // everything else), so a forced default here would silently override
  // that. See decisions/decision-heading-blade-parity-props.md.
  weight: { cssProps: ["font-weight"], prefix: "font-weight", varCategory: "font-weight" },
  // Named scale (xsmall..2xlarge; semantic-typography.json's fontSize block),
  // NOT the raw fontSize.100-900 primitive — same "standalone CSS property
  // wins over variant's own shorthand component, because it's declared
  // later here and generate-atomic-css.mjs iterates this object in
  // declaration order" mechanism `weight` already established. Comes after
  // `weight` specifically so both can be combined and still resolve
  // deterministically against `variant`'s shorthand.
  size: { cssProps: ["font-size"], prefix: "font-size", varCategory: "font-size" },
};

// Text/Heading-exclusive KEYWORD props — fixed CSS keyword values, NOT
// token-scale derived (no var() reference, matching Box's own KEYWORD_PROPS
// shape, e.g. `display`). Hand-listed here deliberately, not a "derive,
// don't hand-list" violation — these are real, unchanging CSS spec keywords
// with no external token source to derive from, same reasoning
// KEYWORD_PROPS itself already relies on. Kept separate from KEYWORD_PROPS
// (Box.tsx never imports this object) for the same structural reason
// TOKEN_TEXT_PROPS is separate from TOKEN_COLOR_PROPS/TOKEN_SCALE_PROPS.
// Shared by both Text and Heading (via resolveExtraTypographyClasses in
// resolveTypographyClasses.ts) — see decisions/decision-heading-blade-parity-props.md.
export const TEXT_KEYWORD_PROPS = {
  textDecorationLine: {
    cssProps: ["text-decoration-line"],
    prefix: "text-decoration",
    values: ["none", "underline", "line-through", "dotted"],
    // "dotted" isn't a real text-decoration-line keyword (that's a
    // text-decoration-style value) — decided explicitly (not shipped as an
    // invalid CSS value) to mean "underline, with a dotted style" as one
    // convenience option. See decisions/decision-text-additional-props.md.
    valueOverrides: {
      dotted: { cssValue: "underline", extraDecl: "text-decoration-style: dotted;" },
    },
  },
  wordBreak: {
    cssProps: ["word-break"],
    prefix: "word-break",
    values: ["normal", "break-all", "keep-all", "break-word"],
  },
  // Blade's real Text/Heading prop reference (both traced against this
  // codebase's own components) — real CSS keywords, closed union rather
  // than Blade's own loose `CSSProperties['textTransform']` typing, same
  // "closed union over raw string" correction wordBreak already got.
  textAlign: {
    cssProps: ["text-align"],
    prefix: "text-align",
    values: ["left", "center", "right", "justify"],
  },
  textTransform: {
    cssProps: ["text-transform"],
    prefix: "text-transform",
    values: ["none", "capitalize", "uppercase", "lowercase"],
  },
};

// Props allowed to vary per breakpoint in the generated CSS — every SPACE_PROPS
// and KEYWORD_PROPS key, matching Box.tsx's own PROP_CONFIG construction
// exactly (responsive: true for both those groups, false for
// TOKEN_COLOR_PROPS/TOKEN_SCALE_PROPS — colors/radius/border-width stay
// static across breakpoints, no real design need for them to respond to
// viewport size yet). Derived, not hand-listed: a hand-listed copy of these
// same keys previously went stale silently when SPACE_PROPS' keys were
// renamed from short to full words (padding, not p) — Box.tsx kept working
// because it never read this array, but generate-atomic-css.mjs's
// RESPONSIVE_PROP_KEYS.includes(propKey) check went permanently false for
// every spacing prop, so no responsive padding/margin rule was generated at
// all despite Box.tsx still emitting the class name. Caught by rebuilding
// build/css/atomic.css and finding zero .ds-p-*@md / .ds-m-*@md rules
// against a real .ds-gap-*@md rule that did generate correctly (gap's key
// was never renamed, so it never went stale). Deriving instead of
// hand-listing makes this specific class of bug structurally impossible to
// reintroduce.
export const RESPONSIVE_PROP_KEYS = [...Object.keys(SPACE_PROPS), ...Object.keys(KEYWORD_PROPS)];

/** Mechanical class-name builder — the ONE naming convention both the
 * generator script and Box.tsx must use, so they can never drift. */
export function className(prefix, value, breakpoint) {
  const base = `ds-${prefix}-${String(value).replace(/\./g, "-")}`;
  return breakpoint ? `${base}@${breakpoint}` : base;
}
