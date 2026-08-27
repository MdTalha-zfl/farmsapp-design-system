/**
 * Type declaration for the build-generated generatedValidSteps.mjs (see
 * scripts/generate-atomic-css.mjs) — hand-authored and committed, same
 * pairing as atomicConfig.d.mts/atomicConfig.mjs, since the .mjs itself is
 * gitignored build output and TypeScript needs a declaration to resolve
 * the import at typecheck time regardless of whether that build output
 * happens to exist on disk yet. Consumed by Box.tsx and, since Phase 5
 * Chunk 04, directly by Text.tsx/Heading.tsx for their own
 * variant/letterSpacing validation.
 */
export declare const VALID_STEPS: Record<string, readonly string[]>;
