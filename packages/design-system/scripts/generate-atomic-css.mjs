#!/usr/bin/env node
/**
 * Generates build/css/atomic.css — Box's entire styling mechanism. Phase 5
 * Chunk 02. See decisions/decision-box-atomic-css-over-inline-styles.md for
 * why this exists instead of runtime inline styles or a CSS-in-JS library:
 * a fixed, finite set of utility classes, generated once at build time,
 * shipped as static CSS. Box.tsx just picks class name strings at render
 * time — no style-object construction, no per-render CSS computation.
 *
 * Reads real step names straight from @farmsapp/tokens' JSON source (not
 * hand-listed here) so a spacing/radius/color-scale change can't silently
 * desync the generated CSS from what the token scale actually contains —
 * same "derive, don't hand-list" discipline as tokens/scripts/build-tokens.mjs
 * itself. Crossing the package boundary to read a sibling package's source
 * (not its published build output) is a deliberate, build-time-only
 * shortcut — tokens doesn't yet publish step-name metadata as its own
 * output, and adding that surface for one internal consumer isn't worth it
 * yet. Revisit if a second consumer needs the same list.
 *
 * Values are NEVER read here — only step names. The generated CSS
 * references custom properties (var(--ds-space-2)), never resolved literals,
 * per decisions/decision-box-must-use-css-custom-properties.md. That's also
 * why this script needs no dark/brand-override awareness at all: the var()
 * reference resolves against whatever tokens.css's cascade currently has
 * live, same as every other consumer of a --ds-* custom property.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import {
  SPACE_PROPS,
  KEYWORD_PROPS,
  TOKEN_COLOR_PROPS,
  TOKEN_SCALE_PROPS,
  TOKEN_TEXT_PROPS,
  TEXT_KEYWORD_PROPS,
  RESPONSIVE_PROP_KEYS,
  className,
} from "../src/components/Box/atomicConfig.mjs";

const tokensDir = new URL("../../tokens/tokens/", import.meta.url);
const readJson = (file) => JSON.parse(readFileSync(new URL(file, tokensDir), "utf8"));

const spacing = readJson("spacing.json");
const semanticColor = readJson("semantic-color.json");
const semanticTypography = readJson("semantic-typography.json");
const typography = readJson("typography.json");
const breakpoints = readJson("breakpoint.json").breakpoint.component;

const spaceSteps = Object.keys(spacing.space);
const scaleSteps = {
  radius: Object.keys(spacing.radius),
  "border-width": Object.keys(spacing.borderWidth),
  // Same "direct var(--ds-{category}-{step}) reference, one CSS property"
  // shape as radius/border-width above — text.* is a composite typography
  // token compiling to the `font` shorthand, letterSpacing is a plain
  // primitive scale, but both generate identically to this file. Read here
  // (not hand-listed) for the same "derive, don't hand-list" reason as
  // every other step list in this file — Phase 5 Chunk 04 (Text/Heading).
  text: Object.keys(semanticTypography.text),
  "letter-spacing": Object.keys(typography.letterSpacing),
  "font-weight": Object.keys(typography.fontWeight),
  // Named scale (xsmall..2xlarge), not the raw fontSize.100-900 primitive —
  // Text's `size` prop. See semantic-typography.json's fontSize block for
  // which primitive step each name aliases.
  "font-size": Object.keys(semanticTypography.fontSize),
};
const colorSteps = {
  "color-surface": Object.keys(semanticColor.color.surface),
  "color-border": Object.keys(semanticColor.color.border),
  "color-text": Object.keys(semanticColor.color.text),
};

const rules = []; // { selector, body } — body is the declaration list, no braces.
const responsiveRules = new Map(); // breakpoint name -> rules[]

function addRule(prefix, value, cssProps, declValue, responsive, extraDecl) {
  const decl = cssProps.map((p) => `${p}: ${declValue};`).join(" ") + (extraDecl ? ` ${extraDecl}` : "");
  rules.push({ selector: `.${className(prefix, value)}`, body: decl });
  if (responsive) {
    for (const bp of Object.keys(breakpoints)) {
      const list = responsiveRules.get(bp) ?? [];
      // The class name itself (as it appears in the DOM's className string,
      // via Box.tsx's own className() call) is unescaped — e.g. "ds-p-2@md".
      // Inside the CSS selector, an unescaped "@" isn't a valid identifier
      // character, so it needs a backslash here. Browsers unescape a
      // selector before matching it against the literal className string,
      // so the two staying textually different is correct, not a bug —
      // same convention Tailwind's own generated output uses for ":".
      const selectorName = className(prefix, value, bp).replace("@", "\\@");
      list.push({ selector: `.${selectorName}`, body: decl });
      responsiveRules.set(bp, list);
    }
  }
}

// Spacing props (padding/margin/gap variants) — value scale = space tokens.
for (const [propKey, cfg] of Object.entries(SPACE_PROPS)) {
  const responsive = RESPONSIVE_PROP_KEYS.includes(propKey);
  for (const step of spaceSteps) {
    addRule(cfg.prefix, step, cfg.cssProps, `var(--ds-space-${step})`, responsive);
  }
  if (cfg.allowAuto) {
    addRule(cfg.prefix, "auto", cfg.cssProps, "auto", responsive);
  }
}

// Keyword props (display, flex-direction, ...) — fixed value lists, no token scale.
for (const [propKey, cfg] of Object.entries(KEYWORD_PROPS)) {
  const responsive = RESPONSIVE_PROP_KEYS.includes(propKey);
  const entries = Array.isArray(cfg.values)
    ? cfg.values.map((v) => [v, v])
    : Object.entries(cfg.values);
  for (const [name, cssValue] of entries) {
    addRule(cfg.prefix, name, cfg.cssProps, cssValue, responsive);
  }
}

// Semantic color props — static across breakpoints (see RESPONSIVE_PROP_KEYS comment).
for (const cfg of Object.values(TOKEN_COLOR_PROPS)) {
  for (const step of colorSteps[cfg.varCategory]) {
    addRule(cfg.prefix, step, cfg.cssProps, `var(--ds-${cfg.varCategory}-${step})`, false, cfg.extraDecl);
  }
}

// Radius / border-width — also static across breakpoints.
for (const cfg of Object.values(TOKEN_SCALE_PROPS)) {
  for (const step of scaleSteps[cfg.varCategory]) {
    addRule(cfg.prefix, step, cfg.cssProps, `var(--ds-${cfg.varCategory}-${step})`, false, cfg.extraDecl);
  }
}

// Text-exclusive props (variant, letterSpacing, color) — Text/Heading only,
// resolved outside Box's own PROP_CONFIG (see the comment on
// TOKEN_TEXT_PROPS in atomicConfig.mjs). Same static-across-breakpoints,
// direct var() shape as the loop above; kept as its own loop rather than
// merged into TOKEN_SCALE_PROPS/TOKEN_COLOR_PROPS specifically so Box.tsx's
// resolver never sees these keys. `color`'s step list lives in colorSteps
// (not scaleSteps) — same reason it did before the move to this object —
// so this loop reads from whichever map actually has its varCategory.
const textPropSteps = { ...scaleSteps, ...colorSteps };
for (const cfg of Object.values(TOKEN_TEXT_PROPS)) {
  for (const step of textPropSteps[cfg.varCategory]) {
    addRule(cfg.prefix, step, cfg.cssProps, `var(--ds-${cfg.varCategory}-${step})`, false, cfg.extraDecl);
  }
}

// Text-exclusive KEYWORD props (textDecorationLine, wordBreak) — fixed CSS
// keywords, no var() reference, same shape as the KEYWORD_PROPS loop above
// but kept separate so Box.tsx never sees these either. valueOverrides lets
// one value emit a *different* CSS value plus an extra declaration — used
// by textDecorationLine's "dotted" (not a real text-decoration-line
// keyword; expands to underline + text-decoration-style: dotted instead of
// shipping an invalid CSS value). Same extraDecl mechanism borderWidth's
// border-style bundling already uses.
for (const cfg of Object.values(TEXT_KEYWORD_PROPS)) {
  for (const name of cfg.values) {
    const override = cfg.valueOverrides?.[name];
    addRule(cfg.prefix, name, cfg.cssProps, override?.cssValue ?? name, false, override?.extraDecl);
  }
}

function formatRules(list) {
  return list.map((r) => `  ${r.selector} { ${r.body} }`).join("\n");
}

const mediaBlocks = Object.entries(breakpoints)
  .map(
    ([name, token]) =>
      `\n  @media (min-width: ${token.$value}px) {\n${formatRules(responsiveRules.get(name) ?? []).replace(/^/gm, "  ")}\n  }`,
  )
  .join("\n");

// base.css is hand-written (not generated — see its own header comment for
// why), read here verbatim and prepended so consumers still only need the
// one `@farmsapp/design-system/css` import. The leading bare `@layer base,
// tokens.component, components;` statement is what actually positions each
// layer correctly in the global cascade-layer order: `tokens.component` was
// already named (and placed last, highest-priority) by tokens.css's own bare
// @layer statement, which loads first in every real consumer (tokens/css
// then design-system/css). Re-stating all three names together here, in
// this order, inserts `base` immediately before tokens.component's
// already-established position, and appends `components` immediately after
// it (highest priority of all) — the standard CSS mechanism for a
// later-loaded stylesheet to slot new layers into specific relative
// positions without having to redeclare the full 5-layer tokens.* order
// itself.
const baseCss = readFileSync(new URL("../src/base.css", import.meta.url), "utf8");

// Same "hand-written, read-and-included-verbatim" discipline as base.css —
// each component's own interactive-state CSS (real :hover/:active/:focus-visible
// rules, not expressible through this file's prop-scale loops above) is
// self-wrapped in `@layer components { ... }` and just concatenated here, so
// consumers still only need the one @farmsapp/design-system/css import. See
// decisions/decision-button-css-hand-written-not-generated.md. New entries
// join this list as each component ships its own hand-written stylesheet.
const componentCssFiles = [
  "../src/components/Spinner/spinner.css",
  "../src/components/Button/button.css",
  "../src/components/IconButton/icon-button.css",
  "../src/components/Badge/badge.css",
  "../src/components/Divider/divider.css",
  "../src/components/FormLabel/formLabel.css",
  "../src/components/FormHint/formHint.css",
  "../src/components/Input/input.css",
  "../src/components/Input/OTPInput/otp-input.css",
  "../src/components/Tooltip/tooltip.css",
  "../src/components/Popover/popover.css",
  "../src/components/Modal/modal.css",
  "../src/components/BottomSheet/bottom-sheet.css",
  "../src/components/Tabs/tabs.css",
  "../src/components/Accordion/accordion.css",
  "../src/components/Carousel/carousel.css",
  "../src/components/Drawer/drawer.css",
  "../src/components/Dropdown/dropdown.css",
  "../src/components/Menu/menu.css",
  "../src/components/ActionList/action-list.css",
  "../src/components/Selector/selector.css",
  "../src/components/Checkbox/checkbox.css",
  "../src/components/Input/CounterInput/counter-input.css",
  "../src/components/SideNav/side-nav.css",
  "../src/components/Radio/radio.css",
  "../src/components/Switch/switch.css",
  "../src/components/Toast/toast.css",
  "../src/components/BottomBar/bottom-bar.css",
  "../src/components/BottomNav/bottom-nav.css",
];
const componentCss = componentCssFiles
  .map((path) => readFileSync(new URL(path, import.meta.url), "utf8"))
  .join("\n");

const output = `/**
 * Do not edit directly — generated by scripts/generate-atomic-css.mjs from
 * @farmsapp/tokens' spacing/semantic-color/breakpoint source, plus the
 * hand-written src/base.css and each component's own hand-written CSS file
 * (see componentCssFiles below) prepended verbatim (see
 * decisions/decision-base-reset-stylesheet.md and
 * decisions/decision-button-css-hand-written-not-generated.md).
 * ${rules.length} base rules, ${Object.keys(breakpoints).length} responsive breakpoint tiers.
 */

@layer ds-base, tokens.component, ds-components;

${baseCss}
@layer tokens.component {
${formatRules(rules)}
${mediaBlocks}
}

${componentCss}
`;

mkdirSync(new URL("../build/css/", import.meta.url), { recursive: true });
writeFileSync(new URL("../build/css/atomic.css", import.meta.url), output);

// Companion output for Box.tsx's dev-mode value validator
// (decisions/decision-box-runtime-token-validation.md) — the same real step
// lists already computed above for the CSS itself (scaleSteps, colorSteps),
// written out again as an importable module so Box.tsx can check an
// incoming prop value against real token step names without a second,
// hand-listed copy of them. A hand-listed second copy is exactly what went
// stale earlier today (RESPONSIVE_PROP_KEYS) — deriving this from the same
// source used for the CSS itself makes that specific mistake impossible to
// repeat here. Written to src/ (not build/) so Rollup bundles it into the
// shipped package, same reason atomicConfig.mjs lives in src/ rather than
// build/; gitignored individually since it's regenerated every build, never
// hand-edited (see .gitignore) — its type shape is declared once, by hand,
// in the committed generatedValidSteps.d.mts alongside it.
writeFileSync(
  new URL("../src/components/Box/generatedValidSteps.mjs", import.meta.url),
  `/**\n * Do not edit directly — generated by scripts/generate-atomic-css.mjs\n * from @farmsapp/tokens' spacing/semantic-color/semantic-typography source,\n * same run that produces build/css/atomic.css. Consumed by Box.tsx's\n * dev-mode token-value validator, and directly by Text.tsx/Heading.tsx for\n * their own variant/letterSpacing validation (see\n * decisions/decision-text-heading-own-typography-props.md for why those\n * two resolve independently of Box's own validator).\n */\nexport const VALID_STEPS = ${JSON.stringify({ ...scaleSteps, ...colorSteps }, null, 2)};\n`,
);

console.log(
  `Wrote build/css/atomic.css — ${rules.length} base rules across ${Object.keys({ ...SPACE_PROPS, ...KEYWORD_PROPS, ...TOKEN_COLOR_PROPS, ...TOKEN_SCALE_PROPS, ...TOKEN_TEXT_PROPS, ...TEXT_KEYWORD_PROPS }).length} props, ${Object.keys(breakpoints).length} responsive breakpoints (${RESPONSIVE_PROP_KEYS.length} responsive-capable props).`,
);
