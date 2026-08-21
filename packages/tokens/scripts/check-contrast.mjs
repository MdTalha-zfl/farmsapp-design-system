#!/usr/bin/env node
/**
 * Build-time WCAG contrast validation for every color pairing this design
 * system actually controls — Theme Runtime Chunk 06.
 *
 * Deliberately NOT the runtime, arbitrary-customer-color checking flagged
 * for Phase 12 (Blade's tinycolor.isReadable() pattern, run against a color
 * nobody has seen yet). Every value checked here is known at build time —
 * that's what makes "fail the build, not silently ship a broken pairing"
 * the right bar, instead of a runtime warning.
 *
 * Resolves token references directly from the DTCG source files, not from
 * generated output — contrast math only needs final resolved hex values, so
 * this doesn't need Style Dictionary's CSS/JS formatting at all, and it
 * doesn't need the dark/brand-pilot trees to have TS output (they
 * deliberately don't — see project memory, TS tokens vs CSS vars).
 *
 * The pairing list below is NOT literally "every text.* against every
 * surface.*" — a real UI pairs colors by USE, not by category name (button
 * text sits on action.primary, not on a surface token at all; status text
 * sits on surface.base OR on its own -subtle background, depending on
 * whether it's inline text or a banner). Hand-picked from actually reading
 * what each semantic token's own $description says it's for.
 */
import { readFileSync } from "node:fs";
import { wcagContrast } from "culori";

const tokensDir = new URL("../tokens/", import.meta.url);
const readJson = (name) => JSON.parse(readFileSync(new URL(name, tokensDir), "utf8"));

function flatten(obj, prefix = [], out = {}) {
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && "$value" in val) {
      out[[...prefix, key].join(".")] = val.$value;
    } else if (val && typeof val === "object") {
      flatten(val, [...prefix, key], out);
    }
  }
  return out;
}

function resolve(map, path, seen = new Set()) {
  if (seen.has(path)) throw new Error(`check-contrast: circular reference at ${path}`);
  seen.add(path);
  const raw = map[path];
  if (raw === undefined) throw new Error(`check-contrast: no token at path "${path}"`);
  const match = /^\{(.+)\}$/.exec(raw);
  if (!match) return raw; // literal (hex, or a color-mix() expression we don't resolve further)
  return resolve(map, match[1], seen);
}

// --- Build the four resolution contexts, mirroring what the real cascade does ---
const primitiveLight = flatten(readJson("color.json"));
const primitiveDark = flatten(readJson("color-dark.json"));
const semanticLight = flatten(readJson("semantic-color.json"));
const semanticDark = flatten(readJson("semantic-color-dark.json"));
const brandPilot = flatten(readJson("brand-pilot.json"));

const lightMap = { ...primitiveLight, ...semanticLight };
const darkMap = { ...primitiveDark, ...semanticDark };
// Brand override: same thing the real cascade does — the pilot's primitive
// values replace the default brand primitives, semantic tokens are
// untouched and resolve through them via var()-equivalent reference chasing.
const brandLightMap = { ...primitiveLight, "color.brand.9": brandPilot["color.brand.9"], "color.brand.10": brandPilot["color.brand.10"], ...semanticLight };
const brandDarkMap = { ...primitiveDark, "color.brand-dark.9": brandPilot["color.brand-dark.9"], "color.brand-dark.10": brandPilot["color.brand-dark.10"], ...semanticDark };

// --- The pairing table — by USE, not by category-name pattern-matching ---
// [label, foregroundPath, backgroundPath, minRatio, contexts]
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3.0;
const BASE_ONLY = ["light", "dark"];
const BRAND_RELEVANT = ["light", "dark", "brand-light", "brand-dark"];

const PAIRS = [
  // Body text on the three surface tiers
  ["text.primary on surface.base", "color.text.primary", "color.surface.base", AA_TEXT, BASE_ONLY],
  ["text.primary on surface.raised", "color.text.primary", "color.surface.raised", AA_TEXT, BASE_ONLY],
  ["text.primary on surface.sunken", "color.text.primary", "color.surface.sunken", AA_TEXT, BASE_ONLY],
  ["text.secondary on surface.base", "color.text.secondary", "color.surface.base", AA_TEXT, BASE_ONLY],
  ["text.secondary on surface.raised", "color.text.secondary", "color.surface.raised", AA_TEXT, BASE_ONLY],
  // Button text — the exact pairing Chunk 03/05 hand-verified; now systematic
  ["text.inverse on action.primary", "color.text.inverse", "color.action.primary", AA_TEXT, BRAND_RELEVANT],
  ["text.inverse on action.primary-hover", "color.text.inverse", "color.action.primary-hover", AA_TEXT, BRAND_RELEVANT],
  // Solid status badges (text.inverse on a feedback color used as a fill)
  ["text.inverse on feedback.success", "color.text.inverse", "color.feedback.success", AA_TEXT, BASE_ONLY],
  ["text.inverse on feedback.warning", "color.text.inverse", "color.feedback.warning", AA_TEXT, BASE_ONLY],
  ["text.inverse on feedback.danger", "color.text.inverse", "color.feedback.danger", AA_TEXT, BASE_ONLY],
  // Inline status text directly on the page
  ["feedback.success on surface.base", "color.feedback.success", "color.surface.base", AA_TEXT, BASE_ONLY],
  ["feedback.warning on surface.base", "color.feedback.warning", "color.surface.base", AA_TEXT, BASE_ONLY],
  ["feedback.danger on surface.base", "color.feedback.danger", "color.surface.base", AA_TEXT, BASE_ONLY],
  // Banner/toast pattern — each -subtle token's own $description says this is its job
  ["feedback.success on feedback.success-subtle", "color.feedback.success", "color.feedback.success-subtle", AA_TEXT, BASE_ONLY],
  ["feedback.warning on feedback.warning-subtle", "color.feedback.warning", "color.feedback.warning-subtle", AA_TEXT, BASE_ONLY],
  ["feedback.danger on feedback.danger-subtle", "color.feedback.danger", "color.feedback.danger-subtle", AA_TEXT, BASE_ONLY],
  // Focus ring — non-text UI component, 3:1 per WCAG 1.4.11, not 4.5:1
  ["focus.ring on surface.base", "color.focus.ring", "color.surface.base", AA_NON_TEXT, BRAND_RELEVANT],
];

const MAPS = { light: lightMap, dark: darkMap, "brand-light": brandLightMap, "brand-dark": brandDarkMap };

let failures = 0;
let checked = 0;
for (const [label, fgPath, bgPath, minRatio, contexts] of PAIRS) {
  for (const ctx of contexts) {
    const map = MAPS[ctx];
    const fg = resolve(map, fgPath);
    const bg = resolve(map, bgPath);
    const ratio = wcagContrast(fg, bg);
    checked += 1;
    const pass = ratio >= minRatio;
    if (!pass) failures += 1;
    console.log(
      `${pass ? "PASS" : "FAIL"} [${ctx.padEnd(11)}] ${label.padEnd(42)} ${ratio.toFixed(2)}:1 (need ${minRatio}:1) ${fg} on ${bg}`,
    );
  }
}

// Informational only — disabled text/controls are conventionally exempt
// from WCAG contrast requirements. Printed, never gates the build.
for (const ctx of ["light", "dark"]) {
  const map = MAPS[ctx];
  const fg = resolve(map, "color.text.disabled");
  const bg = resolve(map, "color.surface.base");
  console.log(`INFO [${ctx.padEnd(11)}] text.disabled on surface.base (exempt)     ${wcagContrast(fg, bg).toFixed(2)}:1  ${fg} on ${bg}`);
}

console.log(`\n${checked - failures}/${checked} pairings pass WCAG.`);
if (failures > 0) {
  console.error(`${failures} contrast failure(s) — see FAIL lines above.`);
  process.exit(1);
}
