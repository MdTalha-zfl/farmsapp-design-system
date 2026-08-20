/**
 * Style Dictionary config — Token Foundation roadmap, Chunk 01.
 * Reads DTCG-format token source from tokens/**\/*.json and produces two
 * outputs: CSS custom properties (consumed via the "./css" export) and a
 * generated TS module that Rollup bundles as this package's normal export.
 * Cascade-layer wrapping (@layer tokens.primitive) is intentionally deferred
 * to Phase 4, when semantic/brand/theme layers actually get composed —
 * out of scope for the primitive tier alone.
 */
export default {
  source: ["tokens/**/*.json"],
  usesDtcg: true,
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      prefix: "ds",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "src/generated/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6",
        },
      ],
    },
  },
};
