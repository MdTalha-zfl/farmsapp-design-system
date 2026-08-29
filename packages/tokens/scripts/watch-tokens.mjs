#!/usr/bin/env node
/**
 * Dev-loop watcher: reruns build-tokens.mjs + assemble-layers.mjs whenever a
 * token JSON source file changes, so build/css/tokens.css — a plain static
 * file Vite only hot-reloads when its own bytes change — actually gets
 * regenerated instead of going stale while Storybook keeps running.
 *
 * Skips check-contrast.mjs and rollup (the rest of the real "build" script):
 * both are slow and irrelevant to the CSS hot-reload loop this exists for.
 * Run `pnpm build` for a full, checked build before publishing/shipping.
 */
import { spawnSync } from "node:child_process";
import { watch } from "node:fs";

const tokensDir = new URL("../tokens/", import.meta.url);

let pending = false;
let running = false;

function rebuild() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  console.log("[tokens watch] rebuilding...");
  const steps = [
    ["node", ["scripts/build-tokens.mjs"]],
    ["node", ["scripts/assemble-layers.mjs"]],
  ];
  for (const [cmd, args] of steps) {
    const result = spawnSync(cmd, args, { stdio: "inherit", cwd: new URL("../", import.meta.url) });
    if (result.status !== 0) {
      console.error("[tokens watch] build failed — fix the error above, watcher is still running.");
      break;
    }
  }
  running = false;
  if (pending) {
    pending = false;
    rebuild();
  }
}

let timer = null;
function scheduleRebuild() {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
}

rebuild();
watch(tokensDir, { recursive: true }, (_event, filename) => {
  if (filename && filename.endsWith(".json")) scheduleRebuild();
});
console.log("[tokens watch] watching tokens/**/*.json for changes...");
