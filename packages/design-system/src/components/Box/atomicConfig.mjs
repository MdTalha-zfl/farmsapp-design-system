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
  color: { cssProps: ["color"], prefix: "text", varCategory: "color-text", tokenPath: ["color", "text"] },
};

export const TOKEN_SCALE_PROPS = {
  borderRadius: { cssProps: ["border-radius"], prefix: "radius", varCategory: "radius", tokenPath: ["radius"] },
  // extraDecl: border-width alone computes as 0 whenever border-style is its
  // own default (none) — a real CSS behavior, not implementation-specific.
  // Bundling border-style: solid here means borderWidth alone just works;
  // pair it with borderColor for anything but the default border color.
  borderWidth: { cssProps: ["border-width"], prefix: "border-width", varCategory: "border-width", tokenPath: ["borderWidth"], extraDecl: "border-style: solid;" },
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
