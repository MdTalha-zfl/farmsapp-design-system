import baseConfig from "./packages/eslint-config/index.mjs";

export default [
  ...baseConfig,
  {
    ignores: ["**/build/**", "**/dist/**", "**/.next/**", "**/.turbo/**", "pnpm-lock.yaml"],
  },
];
