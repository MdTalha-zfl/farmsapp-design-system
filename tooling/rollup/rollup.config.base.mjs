import { readFileSync } from "node:fs";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";
import { preserveDirectives } from "rollup-plugin-preserve-directives";

/**
 * Shared package build config — System Blueprint §01 "Build tooling".
 * Every package's rollup.config.mjs calls this with its own entry points;
 * externals (peerDependencies + dependencies) are inferred from the calling
 * package's own package.json so nothing has to be re-declared per package.
 *
 * NOTE ON RESOLUTION: this file lives in tooling/rollup, not inside any
 * package, so Node resolves its own imports (the plugins above) starting
 * from tooling/rollup upward to the repo root — that's why the plugin
 * packages are root devDependencies, not per-package ones. Each package
 * only needs its own `rollup` devDependency, for the `rollup -c` CLI bin.
 *
 * NOT named tooling/build: a directory literally named "build" collided
 * with the root .gitignore's `build/` pattern (meant for package *output*
 * dirs, but gitignore patterns with no internal slash match at any depth) —
 * this file was silently untracked by git since Phase 1 as a result. See
 * LEARNING.md.
 *
 * @param {string} packageDir - absolute path of the package calling this (import.meta.dirname)
 * @param {Record<string, string>} entries - { outputName: './src/entry.ts' }
 */
export function defineConfig(packageDir, entries) {
  const pkg = JSON.parse(readFileSync(new URL("package.json", `file://${packageDir}/`), "utf8"));
  const external = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];
  const isExternal = (id) => external.some((dep) => id === dep || id.startsWith(`${dep}/`));

  const jsBuild = {
    input: entries,
    external: isExternal,
    output: {
      dir: "build",
      format: "esm",
      entryFileNames: "[name].js",
      preserveModules: true,
      preserveModulesRoot: "src",
      sourcemap: true,
    },
    plugins: [
      resolve({ extensions: [".mjs", ".js", ".ts", ".tsx", ".json"] }),
      commonjs(),
      esbuild({ target: "es2022", jsx: "automatic" }),
      // Rollup silently drops module-level directives ("use client", "use
      // server") when bundling — confirmed by reading the actual build
      // output, not assumed from a warning. Without this, any package
      // exporting a hooks-using component (Theme Runtime Chunk 04's
      // ThemeProvider is the first) builds clean but breaks the moment
      // Next.js App Router imports it, since the client/server boundary
      // marker never reaches the published package.
      preserveDirectives(),
    ],
  };

  const dtsBuild = {
    input: entries,
    external: isExternal,
    output: {
      dir: "build",
      format: "esm",
      entryFileNames: "[name].d.ts",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [dts()],
  };

  return [jsBuild, dtsBuild];
}
