import config from "@farmsapp/eslint-config/react";

export default [
  ...config,
  {
    // Next.js generates this file itself, with a triple-slash reference by
    // convention — not ours to fix.
    ignores: ["next-env.d.ts"],
  },
];
