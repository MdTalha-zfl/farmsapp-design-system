import baseConfig from "./packages/eslint-config/index.mjs";

export default [
  ...baseConfig,
  {
    ignores: [
      "**/build/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/next-env.d.ts",
      "pnpm-lock.yaml",
    ],
  },
  {
    // Build-time CLI scripts, not shipped library code — console output is
    // the point, not an accident. Mirrors the same exception in
    // packages/tokens/eslint.config.mjs, needed here too since flat-config
    // ESLint doesn't cascade into subdirectory configs on a root `eslint .`.
    files: ["**/scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
];
