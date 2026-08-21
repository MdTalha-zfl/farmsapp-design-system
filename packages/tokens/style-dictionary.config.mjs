/**
 * Style Dictionary config — Token Foundation Chunk 01, extended in Theme
 * Runtime Chunk 01 for cascade-layer wrapping and Chunk 03 for theme-level
 * value switching.
 *
 * Reads DTCG-format token source from tokens/**\/*.json and produces: CSS
 * custom properties (consumed via the "./css" export) and a generated TS
 * module Rollup bundles as this package's normal export.
 *
 * CASCADE LAYERS: Style Dictionary's built-in css/variables format has no
 * native concept of @layer — it only ever emits a flat `:root { ... }`
 * block, verified by testing rather than assumed. So the CSS platform emits
 * three intermediate files (_primitive.css, _semantic.css, _theme-dark.css),
 * split by which source file a token came from using Style Dictionary's own
 * `token.filePath` metadata — not a hardcoded list of category names, which
 * would silently go stale the next time a token category gets added.
 * scripts/assemble-layers.mjs then wraps each in its @layer block (the theme
 * file additionally gets wrapped in a `[data-theme="dark"]` selector) and
 * writes the final tokens.css — see that script for why a plain
 * post-processing step was chosen over reimplementing the CSS formatter.
 *
 * THEME MODE SWITCHING — TWO CONFIGS, NOT ONE: DTCG has a "modes" concept for
 * exactly this (one token, multiple mode-scoped values), but Style Dictionary
 * 4.4.0 has zero support for it — confirmed by grepping the installed
 * package, not assumed from the spec existing. The manual two-tree fallback
 * flagged as the alternative turned out to need two entirely separate
 * `source` trees, not just a third output file on one shared config: Style
 * Dictionary resolves every sourced file into ONE token tree before any
 * platform/format runs, and `color.surface.base` defined identically in both
 * tokens/semantic-color.json and tokens/semantic-color-dark.json collided —
 * 93 collisions, found by actually running the build, not predicted upfront.
 * A CSS-output filter can't fix a collision that happens at the data-model
 * level, before formatting exists. So this file exports two configs — see
 * scripts/build-tokens.mjs, which runs each as its own independent
 * StyleDictionary instance with its own `source`, so `color.surface.base`
 * is only ever resolved once per build. The dark build's `source`
 * deliberately excludes tokens/semantic-color.json entirely.
 *
 * The dark semantic build only needs a CSS platform, not JS — see
 * project memory (TS tokens vs CSS vars): TS constants always flatten to
 * literals and can't participate in a runtime theme switch, so generating
 * them for a tier nothing consumes yet would be speculative surface area
 * with no current payoff.
 *
 * See tokens/semantic-color-dark.json's own comments for two tokens that
 * deliberately do NOT get a mechanical light-name → dark-name substitution
 * (surface.overlay, text.inverse) because their light-mode alias borrows a
 * primitive step for its absolute lightness, not its role in the scale.
 *
 * SHADOWS GET THE SAME TREATMENT (Chunk 07 close-out): the original Chunk 03
 * scope was "the semantic tier's dark-mode values," but only ever delivered
 * color — shadow.raised/overlay are hardcoded black rgba values with no dark
 * variant, found during this phase's own close-out re-check, the same kind
 * of gap the Phase 2/3 close-outs caught (missing focus states, undocumented
 * z-index reasoning). tokens/shadow-dark.json (primitive, -dark suffix
 * convention, no collision, flows through lightConfig same as color-dark)
 * and tokens/semantic-elevation-dark.json (needs isolation, same reason as
 * every other dark-semantic file) fix it. `isSemanticDarkFile` below is now
 * a naming-convention check (tokens/semantic-*-dark.json) rather than one
 * hardcoded filename, so a third dark-semantic category later doesn't need
 * a code change here — the same "don't hardcode a list that goes stale"
 * principle already applied to isSemanticFile.
 *
 * BRAND OVERRIDES (Chunk 05) — same isolated-tree pattern, a third time:
 * brandPilotConfig sources tokens/brand-pilot.json in total isolation for
 * the same collision reason as darkConfig, and scripts/assemble-layers.mjs
 * wraps its output under [data-brand="pilot"] in the tokens.brand layer.
 * See decisions/decision-brand-override-targets-primitives.md for why the
 * override targets primitive custom properties, not semantic ones — it's
 * the only way a brand override survives dark mode being active at the
 * same time, given tokens.brand is declared before tokens.theme.
 *
 * Breakpoints are excluded from the CSS platform: a CSS custom property
 * cannot be used inside an @media condition — browsers require a literal
 * value there, not var(--x) — so a breakpoint token is only ever usable as
 * a JS/TS value. Generating it into tokens.css anyway would produce a
 * custom property that looks usable but silently isn't.
 */
const isSemanticFile = (token) => token.filePath.includes("semantic-");
const isSemanticDarkFile = (token) => {
  const file = token.filePath.replaceAll("\\", "/");
  return file.startsWith("tokens/semantic-") && file.endsWith("-dark.json");
};

export const lightConfig = {
  // `source` intentionally left for build-tokens.mjs to fill in dynamically
  // (every tokens/**/*.json file except semantic-color-dark.json). Style
  // Dictionary's `source` array has no glob-negation semantics — each entry
  // is run through globSync independently and concatenated, so a leading
  // "!" is just a literal pattern that matches nothing, not an exclusion.
  // Found by running the build and reading its collision diagnostic, not
  // predicted from the config API.
  source: [],
  usesDtcg: true,
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      prefix: "ds",
      files: [
        {
          destination: "_primitive.css",
          format: "css/variables",
          filter: (token) => token.path[0] !== "breakpoint" && !isSemanticFile(token),
          options: { outputReferences: true },
        },
        {
          destination: "_semantic.css",
          format: "css/variables",
          filter: (token) => token.path[0] !== "breakpoint" && isSemanticFile(token),
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "src/generated/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6",
        },
      ],
    },
  },
};

export const darkConfig = {
  // Deliberately NOT tokens/**/*.json — this tree must never see
  // tokens/semantic-color.json or tokens/semantic-elevation.json, or their
  // dark counterparts collide with themselves on the same token paths.
  source: [
    "tokens/color-dark.json",
    "tokens/semantic-color-dark.json",
    "tokens/shadow-dark.json",
    "tokens/semantic-elevation-dark.json",
  ],
  usesDtcg: true,
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      prefix: "ds",
      files: [
        {
          // Only the semantic aliases — color-dark.json/shadow-dark.json's
          // own primitives are already emitted once, by lightConfig's
          // _primitive.css (they're loaded into this tree only so the
          // semantic files' references can resolve).
          destination: "_theme-dark.css",
          format: "css/variables",
          filter: (token) => isSemanticDarkFile(token),
          options: { outputReferences: true },
        },
      ],
    },
  },
};

// Theme Runtime Chunk 05 — see decisions/decision-brand-override-targets-primitives.md
// for why this deliberately re-uses the paths color.brand.9/10 and
// color.brand-dark.9/10 (the exact same paths lightConfig's tree already
// defines): the override has to redeclare the same CSS custom property
// names, scoped under [data-brand="pilot"], for var() references elsewhere
// to pick it up. Same reason as darkConfig above, this needs its own
// isolated source tree — loading brand-pilot.json alongside color.json in
// one tree would collide on those exact paths.
export const brandPilotConfig = {
  source: ["tokens/brand-pilot.json"],
  usesDtcg: true,
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      prefix: "ds",
      files: [
        {
          destination: "_brand-pilot.css",
          format: "css/variables",
        },
      ],
    },
  },
};

export default lightConfig;
