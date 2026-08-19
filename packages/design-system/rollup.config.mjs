import { defineConfig } from "../../tooling/build/rollup.config.base.mjs";

export default defineConfig(import.meta.dirname, {
  index: "./src/index.ts",
});
