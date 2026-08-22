import config from "@farmsapp/eslint-config";

export default [
  ...config,
  {
    // Build-time CLI scripts, not shipped library code — console output is
    // the point, not an accident. Same convention as packages/tokens.
    files: ["scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
];
