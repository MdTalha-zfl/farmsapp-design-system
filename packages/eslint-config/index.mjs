// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

/**
 * Base flat config shared by every package in the monorepo.
 * Framework-specific rules (React, JSX a11y) live in ./react.mjs so that
 * framework-free packages like `tokens` and `utilities` aren't forced to
 * depend on React tooling.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    ignores: ["**/build/**", "**/dist/**", "**/.next/**", "**/.turbo/**", "**/coverage/**"],
  },
  prettier,
);

// NOTE (Phase 5): a custom rule rejecting raw hex/px literals inside
// `packages/components` and `packages/primitives` is added here once those
// packages contain real component code — see System Blueprint §05.
