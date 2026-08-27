/**
 * Hand-written type surface for atomicConfig.mjs — kept as plain JS (not
 * .ts) because scripts/generate-atomic-css.mjs is a Node script that
 * imports it directly with no build step. Node's native TypeScript support
 * is explicitly experimental and only strips types, never checks them —
 * tested directly (2026-08-22) with a real multi-export .ts file including
 * interface/type-annotation syntax, and it ran correctly on this Node
 * version, so an earlier claim that it silently dropped exports here did
 * NOT reproduce (see LEARNING.md, Phase 5 Chunk 04 entry, for the full
 * test). Kept as .mjs anyway: relying on a still-evolving experimental
 * runtime feature for the actual build pipeline is a real, ongoing risk
 * plain .mjs simply doesn't carry, independent of whether today's specific
 * test happens to pass. This .d.mts is the only place the shape has to be
 * kept in sync by hand if a field is added.
 */

export interface SpacePropConfig {
  cssProps: string[];
  prefix: string;
  allowAuto?: boolean;
}

export interface KeywordPropConfig {
  cssProps: string[];
  prefix: string;
  values: string[] | Record<string, string>;
}

export interface TokenColorPropConfig {
  cssProps: string[];
  prefix: string;
  varCategory: "color-surface" | "color-border" | "color-text";
  tokenPath: string[];
  extraDecl?: string;
}

export interface TokenScalePropConfig {
  cssProps: string[];
  prefix: string;
  varCategory: "radius" | "border-width";
  tokenPath: string[];
  extraDecl?: string;
}

export interface TokenTextPropConfig {
  cssProps: string[];
  prefix: string;
  varCategory: "text" | "letter-spacing" | "color-text" | "font-weight" | "font-size";
  tokenPath?: string[];
}

export interface TextKeywordValueOverride {
  cssValue: string;
  extraDecl?: string;
}

export interface TextKeywordPropConfig {
  cssProps: string[];
  prefix: string;
  values: string[];
  valueOverrides?: Record<string, TextKeywordValueOverride>;
}

export const SPACE_PROPS: Record<string, SpacePropConfig>;
export const KEYWORD_PROPS: Record<string, KeywordPropConfig>;
export const TOKEN_COLOR_PROPS: Record<string, TokenColorPropConfig>;
export const TOKEN_SCALE_PROPS: Record<string, TokenScalePropConfig>;
// Exact shape, not Record<string, ...> — unlike SPACE_PROPS/KEYWORD_PROPS
// (many keys, always iterated generically via Object.entries),
// resolveTypographyClasses.ts and Text.tsx access these keys directly by
// name, so a loose Record type would make every access "possibly
// undefined" under this project's noUncheckedIndexedAccess
// (tsconfig.base.json) even though the real object always has all four
// keys. `color` joined 2026-08-22, `weight` and `size` joined later —
// see the comments on TOKEN_TEXT_PROPS in atomicConfig.mjs.
export const TOKEN_TEXT_PROPS: {
  variant: TokenTextPropConfig;
  letterSpacing: TokenTextPropConfig;
  color: TokenTextPropConfig;
  weight: TokenTextPropConfig;
  size: TokenTextPropConfig;
};
// Same "exact shape, not Record<string, ...>" reasoning as TOKEN_TEXT_PROPS.
export const TEXT_KEYWORD_PROPS: {
  textDecorationLine: TextKeywordPropConfig;
  wordBreak: TextKeywordPropConfig;
  textAlign: TextKeywordPropConfig;
  textTransform: TextKeywordPropConfig;
};
export const RESPONSIVE_PROP_KEYS: string[];

export function className(prefix: string, value: string | number, breakpoint?: string): string;
