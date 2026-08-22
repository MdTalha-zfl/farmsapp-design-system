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
  RESPONSIVE_PROP_KEYS,
  className,
} from "../src/components/Box/atomicConfig.mjs";

const tokensDir = new URL("../../tokens/tokens/", import.meta.url);
const readJson = (file) => JSON.parse(readFileSync(new URL(file, tokensDir), "utf8"));

const spacing = readJson("spacing.json");
const semanticColor = readJson("semantic-color.json");
const breakpoints = readJson("breakpoint.json").breakpoint.component;

const spaceSteps = Object.keys(spacing.space);
const scaleSteps = {
  radius: Object.keys(spacing.radius),
  "border-width": Object.keys(spacing.borderWidth),
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

function formatRules(list) {
  return list.map((r) => `  ${r.selector} { ${r.body} }`).join("\n");
}

const mediaBlocks = Object.entries(breakpoints)
  .map(
    ([name, token]) =>
      `\n  @media (min-width: ${token.$value}px) {\n${formatRules(responsiveRules.get(name) ?? []).replace(/^/gm, "  ")}\n  }`,
  )
  .join("\n");

const output = `/**
 * Do not edit directly — generated by scripts/generate-atomic-css.mjs from
 * @farmsapp/tokens' spacing/semantic-color/breakpoint source. ${rules.length} base
 * rules, ${Object.keys(breakpoints).length} responsive breakpoint tiers.
 */

@layer tokens.component {
${formatRules(rules)}
${mediaBlocks}
}
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
  `/**\n * Do not edit directly — generated by scripts/generate-atomic-css.mjs\n * from @farmsapp/tokens' spacing/semantic-color source, same run that\n * produces build/css/atomic.css. Consumed only by Box.tsx's dev-mode\n * token-value validator.\n */\nexport const VALID_STEPS = ${JSON.stringify({ ...scaleSteps, ...colorSteps }, null, 2)};\n`,
);

console.log(
  `Wrote build/css/atomic.css — ${rules.length} base rules across ${Object.keys({ ...SPACE_PROPS, ...KEYWORD_PROPS, ...TOKEN_COLOR_PROPS, ...TOKEN_SCALE_PROPS }).length} props, ${Object.keys(breakpoints).length} responsive breakpoints (${RESPONSIVE_PROP_KEYS.length} responsive-capable props).`,
);
