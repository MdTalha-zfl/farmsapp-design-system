import config from "@farmsapp/eslint-config";

export default [
  ...config,
  {
    // Build-time CLI scripts, not shipped library code — console output is
    // the point, not an accident.
    files: ["scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
];
