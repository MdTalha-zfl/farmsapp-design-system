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
];
