import { defineConfig } from "../../tooling/rollup/rollup.config.base.mjs";

export default defineConfig(import.meta.dirname, {
  index: "./src/index.tsx",
  "index.native": "./src/index.native.tsx",
});
