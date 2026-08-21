#!/usr/bin/env node
/**
 * Generates 12-step, Radix Colors-style accessibility-paired color scales
 * in OKLCH (a perceptually uniform color space — equal steps in lightness
 * look like equal steps to the human eye, unlike RGB or HSL), then converts
 * each step to sRGB hex for the DTCG token source files.
 *
 * Generates both a light-context scale (tuned for a light/white background)
 * and a dark-context companion scale (tuned independently, not inverted —
 * see Theme Runtime roadmap Chunk 02) per family.
 *
 * Step roles (same convention in both contexts):
 *   1-2   App / subtle backgrounds
 *   3-5   UI element background (default / hover / active)
 *   6-8   Borders (subtle / default / hover)
 *   9-10  Solid backgrounds (default / hover) — the "flagship" brand color
 *   11-12 Text (low-contrast / high-contrast)
 *
 * Usage: node scripts/generate-scale.mjs
 */
import { converter, formatHex, wcagContrast, clampChroma } from "culori";
import { writeFileSync, mkdirSync } from "node:fs";

const toOklch = converter("oklch");

/**
 * @param {string} name - token family name, e.g. "brand", "neutral"
 * @param {{h: number, c: number}} hue - hue angle + a chroma character for this family
 * @param {number[]} lightnessCurve - 12 target L values, step 1 → step 12
 * @param {number[]} chromaCurve - 12 target C values, step 1 → step 12
 * @param {{step: number, l: number, c: number}} [anchorOverride] - pins one step to an exact L/C (used for the brand anchor)
 */
function generateScale(name, hue, lightnessCurve, chromaCurve, anchorOverride) {
  const steps = lightnessCurve.map((l, i) => {
    const step = i + 1;
    const useL = anchorOverride?.step === step ? anchorOverride.l : l;
    const requestedC = anchorOverride?.step === step ? anchorOverride.c : chromaCurve[i];
    const inGamut = clampChroma({ mode: "oklch", l: useL, c: requestedC, h: hue }, "oklch", "rgb");
    const hex = formatHex(inGamut);
    // clampChroma silently pulls out-of-gamut points back in. Recording what
    // we asked for vs. what we got is how the Chunk 02 dark-scale seam bug
    // (Blade's generator had this: a step gets clamped much harder than its
    // neighbors, producing a visible desaturation jump) gets caught by a
    // script instead of an eyeball.
    const actual = toOklch(inGamut);
    return { step, hex, l: useL, requestedC, actualC: actual.c };
  });

  return { name, steps };
}

/** Flags any step where clampChroma cut chroma much harder than its neighbors did. */
function reportClampSeams(scale) {
  const seams = scale.steps.filter((s) => {
    if (s.requestedC <= 0) return false;
    const reduction = 1 - s.actualC / s.requestedC;
    return reduction > 0.1; // more than 10% of requested chroma clipped
  });
  if (seams.length === 0) {
    console.log(`  ${scale.name.padEnd(12)} no clamp seams (all steps within requested chroma budget)`);
  } else {
    for (const s of seams) {
      const reduction = ((1 - s.actualC / s.requestedC) * 100).toFixed(0);
      console.log(
        `  ${scale.name.padEnd(12)} step ${s.step}: requested c=${s.requestedC.toFixed(3)}, got c=${s.actualC.toFixed(3)} (clamped ${reduction}% — possible seam)`,
      );
    }
  }
}

// --- Brand (anchored to #193921) ------------------------------------------
const anchor = toOklch("#193921");
console.log(`Brand anchor #193921 → OKLCH l=${anchor.l.toFixed(4)} c=${anchor.c.toFixed(4)} h=${anchor.h.toFixed(2)}`);

const brand = generateScale(
  "brand",
  anchor.h,
  [0.995, 0.96, 0.91, 0.855, 0.79, 0.71, 0.62, 0.51, anchor.l, 0.275, 0.235, 0.185],
  [0.003, 0.008, 0.015, 0.024, 0.032, 0.04, 0.048, 0.054, anchor.c, 0.06, 0.055, 0.045],
  { step: 9, l: anchor.l, c: anchor.c },
);

// --- Neutral (subtly tinted with the brand hue, very low chroma) ----------
const neutral = generateScale(
  "neutral",
  anchor.h,
  [0.995, 0.97, 0.93, 0.88, 0.82, 0.75, 0.68, 0.6, 0.5, 0.42, 0.32, 0.2],
  [0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.008, 0.007, 0.006, 0.004],
);

// --- Status hues (raw primitives only — semantic assignment is Phase 3) ---
const danger = generateScale(
  "danger",
  27, // red
  [0.995, 0.97, 0.93, 0.88, 0.81, 0.73, 0.65, 0.58, 0.5, 0.43, 0.35, 0.24],
  [0.005, 0.015, 0.03, 0.05, 0.075, 0.1, 0.13, 0.15, 0.17, 0.16, 0.14, 0.1],
);

// Steps 9-12 shifted 0.10 darker than the original curve (theme runtime
// Chunk 06's WCAG contrast checker caught step 9, #a46e00 at l=.58, failing
// 4.5:1 against both white text and its own -subtle background — 4.32:1
// and 3.56:1. Amber needs to sit noticeably darker than the other status
// hues to read as AA-legible; a uniform shift across 9-12 keeps the
// existing inter-step deltas (and the clamp-seam-checked smoothness from
// Chunk 02) intact rather than only patching step 9 in isolation.
const warning = generateScale(
  "warning",
  75, // amber
  [0.995, 0.97, 0.93, 0.88, 0.82, 0.76, 0.7, 0.64, 0.48, 0.4, 0.3, 0.18],
  [0.005, 0.015, 0.03, 0.05, 0.07, 0.09, 0.11, 0.13, 0.14, 0.13, 0.11, 0.08],
);

// Success — deliberately NOT the brand hue (150°). Semantic Layer Chunk 03:
// success gets its own dedicated hue rather than reusing brand green, so a
// "succeeded" signal never reads as "just brand chrome." Shifted to a more
// vivid spring-green (140°) with meaningfully higher chroma than the brand's
// muted 0.057 — brand is deliberately calm/muted/dark, success needs to be
// immediate and legible at a glance, a different design intent, not just a
// different number.
const success = generateScale(
  "success",
  140,
  [0.995, 0.97, 0.93, 0.88, 0.81, 0.73, 0.65, 0.57, 0.49, 0.42, 0.34, 0.23],
  [0.008, 0.02, 0.04, 0.065, 0.09, 0.115, 0.14, 0.16, 0.17, 0.155, 0.135, 0.1],
);

console.log("\nBrand scale, all 12 steps (checking for smoothness, not just contrast):");
for (const s of brand.steps) {
  console.log(`  step ${String(s.step).padStart(2)}: ${s.hex}  (l=${s.l.toFixed(3)})`);
}

// --- Verify accessibility claims for the text steps (11, 12) --------------
console.log("\nText-step contrast against white:");
for (const scale of [brand, neutral, danger, warning, success]) {
  const s11 = scale.steps[10];
  const s12 = scale.steps[11];
  console.log(
    `  ${scale.name.padEnd(8)} step 11: ${s11.hex} → ${wcagContrast(s11.hex, "#ffffff").toFixed(2)}:1   ` +
      `step 12: ${s12.hex} → ${wcagContrast(s12.hex, "#ffffff").toFixed(2)}:1`,
  );
}

console.log("\nClamp-seam check (light scales, as a regression guard):");
for (const scale of [brand, neutral, danger, warning, success]) {
  reportClampSeams(scale);
}

// --- Dark-context companion scales -----------------------------------------
// NOT a `.reverse()` of the light curves — see Theme Runtime roadmap Chunk 02.
// Two things break under naive inversion:
//  1. The sRGB gamut narrows sharply near L=0 and L=1, at different rates
//     than near the light scale's working range. Reusing the light chroma
//     curve at inverted (low) L makes clampChroma clip several steps much
//     harder than their neighbors — an abrupt desaturation "seam." That's
//     the exact bug class flagged from the Blade generator comparison.
//     `reportClampSeams` below is the automated check for it.
//  2. The brand anchor's role inverts. #193921 is dark; it works as light
//     step 9 because it's dark-on-light. The same hex as dark step 9 would
//     be a near-black solid on a near-black background — illegible. Dark
//     step 9 instead uses a lighter, more vivid tint of the same hue.
// Step 1 lands at L≈0.15, not L≈0 — pure black backgrounds cause halation
// and OLED smearing. Step 12 lands at L≈0.92-0.94, not L≈0.995 — pure white
// text on a dark surface is harsh (known dark-UI convention, matches what
// the Blade comparison found in their dark scale too).
const brandDark = generateScale(
  "brand-dark",
  anchor.h,
  [0.15, 0.185, 0.23, 0.275, 0.325, 0.385, 0.455, 0.535, 0.68, 0.74, 0.8, 0.93],
  [0.006, 0.008, 0.012, 0.018, 0.026, 0.034, 0.042, 0.05, 0.13, 0.115, 0.05, 0.03],
);

const neutralDark = generateScale(
  "neutral-dark",
  anchor.h,
  [0.15, 0.185, 0.23, 0.275, 0.325, 0.385, 0.455, 0.535, 0.615, 0.685, 0.78, 0.92],
  [0.004, 0.004, 0.005, 0.005, 0.006, 0.006, 0.007, 0.007, 0.006, 0.006, 0.004, 0.003],
);

// Steps 9-12 taper faster than the other dark families' chroma curves — the
// clamp-seam check (see generateScale) exposed that red near L≈0.93 has a
// much narrower sRGB chroma ceiling than red near L≈0.65-0.71 does. Holding
// chroma high through step 11 then requesting 0.07 at step 12 produced a
// single-step cliff (actual chroma fell 68% in one step, from ~0.11 to
// ~0.035) rather than the gradual taper every other family shows. This
// curve requests values close to what the gamut can actually deliver at
// each step, so the taper is smooth by construction instead of by luck.
const dangerDark = generateScale(
  "danger-dark",
  27,
  [0.15, 0.185, 0.23, 0.275, 0.325, 0.385, 0.455, 0.535, 0.65, 0.71, 0.8, 0.93],
  [0.01, 0.02, 0.035, 0.055, 0.08, 0.105, 0.13, 0.15, 0.175, 0.125, 0.08, 0.05],
);

const warningDark = generateScale(
  "warning-dark",
  75,
  [0.15, 0.185, 0.23, 0.275, 0.325, 0.385, 0.455, 0.535, 0.68, 0.74, 0.82, 0.94],
  [0.01, 0.02, 0.035, 0.05, 0.07, 0.09, 0.11, 0.13, 0.145, 0.13, 0.09, 0.06],
);

const successDark = generateScale(
  "success-dark",
  140,
  [0.15, 0.185, 0.23, 0.275, 0.325, 0.385, 0.455, 0.53, 0.64, 0.7, 0.79, 0.93],
  [0.012, 0.025, 0.045, 0.07, 0.095, 0.12, 0.145, 0.165, 0.18, 0.16, 0.11, 0.07],
);

const darkScales = [brandDark, neutralDark, dangerDark, warningDark, successDark];

console.log("\nClamp-seam check (dark scales — this is the real risk surface for this chunk):");
for (const scale of darkScales) {
  reportClampSeams(scale);
}

// Contrast against a DARK surface, not white — that's the whole point of a
// dark-context scale. Text steps (11/12) are checked against the dark
// scale's own step-1 (page bg) and step-2 (raised bg).
console.log("\nText-step contrast against dark surfaces (neutral-dark step 1 / step 2):");
const darkBg1 = neutralDark.steps[0].hex;
const darkBg2 = neutralDark.steps[1].hex;
for (const scale of darkScales) {
  const s11 = scale.steps[10];
  const s12 = scale.steps[11];
  console.log(
    `  ${scale.name.padEnd(12)} step 11: ${s11.hex} → ${wcagContrast(s11.hex, darkBg1).toFixed(2)}:1 on bg1, ${wcagContrast(s11.hex, darkBg2).toFixed(2)}:1 on bg2   ` +
      `step 12: ${s12.hex} → ${wcagContrast(s12.hex, darkBg1).toFixed(2)}:1 on bg1, ${wcagContrast(s12.hex, darkBg2).toFixed(2)}:1 on bg2`,
  );
}

// Solid action color (step 9) only needs the non-text 3:1 UI-component
// guideline against the page background, not the 4.5:1 text guideline.
console.log("\nSolid step 9 (action color) contrast against dark page bg (neutral-dark step 1):");
for (const scale of darkScales) {
  const s9 = scale.steps[8];
  console.log(`  ${scale.name.padEnd(12)} step 9: ${s9.hex} → ${wcagContrast(s9.hex, darkBg1).toFixed(2)}:1`);
}

// --- Write DTCG token source ------------------------------------------------
function toDtcg(scale) {
  const out = {};
  for (const s of scale.steps) {
    out[String(s.step)] = { $value: s.hex, $type: "color" };
  }
  return out;
}

mkdirSync(new URL("../tokens", import.meta.url), { recursive: true });
const payload = {
  color: {
    brand: toDtcg(brand),
    neutral: toDtcg(neutral),
    danger: toDtcg(danger),
    warning: toDtcg(warning),
    success: toDtcg(success),
  },
};
const outPath = new URL("../tokens/color.json", import.meta.url);
writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
console.log(`\nWrote ${outPath.pathname.replace(/^\/([A-Za-z]:)/, "$1")}`);

// Kept in a separate file/family namespace (brand-dark, neutral-dark, ...)
// rather than folded into color.json under a DTCG "mode" — how these values
// actually get selected at runtime (SD modes vs. a manual selector-scoped
// tree) is the open unknown for Theme Runtime Chunk 03, not this chunk.
const darkPayload = {
  color: {
    "brand-dark": toDtcg(brandDark),
    "neutral-dark": toDtcg(neutralDark),
    "danger-dark": toDtcg(dangerDark),
    "warning-dark": toDtcg(warningDark),
    "success-dark": toDtcg(successDark),
  },
};
const darkOutPath = new URL("../tokens/color-dark.json", import.meta.url);
writeFileSync(darkOutPath, JSON.stringify(darkPayload, null, 2) + "\n");
console.log(`Wrote ${darkOutPath.pathname.replace(/^\/([A-Za-z]:)/, "$1")}`);
