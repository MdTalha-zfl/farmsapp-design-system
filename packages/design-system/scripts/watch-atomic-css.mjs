#!/usr/bin/env node
/**
 * Dev-loop watcher: reruns generate-atomic-css.mjs whenever one of its real
 * inputs changes (base.css, any component's hand-written CSS, Box's
 * atomicConfig.mjs, or the tokens package's JSON source it reads step names
 * from) — see that script's own header for why nothing does this
 * automatically: build/css/atomic.css is a plain static file, and Vite only
 * hot-reloads a file when *its own bytes* change, not when something the
 * generator read to produce it changes.
 */
import { spawnSync } from "node:child_process";
import { watch } from "node:fs";

const srcDir = new URL("../src/", import.meta.url);
const tokensDir = new URL("../../tokens/tokens/", import.meta.url);

let pending = false;
let running = false;

function rebuild() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  console.log("[atomic-css watch] rebuilding...");
  const result = spawnSync("node", ["scripts/generate-atomic-css.mjs"], {
    stdio: "inherit",
    cwd: new URL("../", import.meta.url),
  });
  if (result.status !== 0) {
    console.error("[atomic-css watch] build failed — fix the error above, watcher is still running.");
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
watch(srcDir, { recursive: true }, (_event, filename) => {
  if (filename && (filename.endsWith(".css") || filename.endsWith("atomicConfig.mjs"))) scheduleRebuild();
});
watch(tokensDir, { recursive: true }, (_event, filename) => {
  if (filename && filename.endsWith(".json")) scheduleRebuild();
});
console.log("[atomic-css watch] watching src/**/*.css, atomicConfig.mjs, and ../tokens/tokens/**/*.json...");
