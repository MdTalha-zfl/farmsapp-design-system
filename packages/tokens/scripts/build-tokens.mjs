#!/usr/bin/env node
/**
 * Runs the independent Style Dictionary builds defined in
 * style-dictionary.config.mjs — see that file's comments for why this can't
 * be one `style-dictionary build --config ...` CLI invocation: each config
 * resolves its own token tree, so token paths that deliberately collide
 * across trees (color.surface.base in light vs. dark; color.brand.9 in the
 * real primitives vs. the pilot brand override) never actually collide in
 * practice. Theme Runtime Chunks 03, 05, and 07 (shadows got the same
 * dark-semantic treatment as color during the phase close-out).
 */
import { readdirSync } from "node:fs";
import StyleDictionary from "style-dictionary";
import { lightConfig, darkConfig, brandPilotConfig } from "../style-dictionary.config.mjs";

// Every tokens/**/*.json file except the isolated-tree files — computed, not
// hand-listed, so a future new token category file is picked up
// automatically instead of silently missing. Dark-semantic files are
// excluded by the same naming convention style-dictionary.config.mjs's
// isSemanticDarkFile checks (tokens/semantic-*-dark.json); brand-pilot.json
// doesn't fit that convention (it's a primitive-shaped override, not a
// semantic tree) so it's still named explicitly.
const isIsolatedTreeFile = (f) => (f.startsWith("semantic-") && f.endsWith("-dark.json")) || f === "brand-pilot.json";
const tokensDir = new URL("../tokens/", import.meta.url);
const lightSource = readdirSync(tokensDir, { recursive: true })
  .filter((f) => f.endsWith(".json") && !isIsolatedTreeFile(f))
  .map((f) => `tokens/${f.replaceAll("\\", "/")}`);

const light = new StyleDictionary({ ...lightConfig, source: lightSource });
await light.buildAllPlatforms();

const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();

const brandPilot = new StyleDictionary(brandPilotConfig);
await brandPilot.buildAllPlatforms();
