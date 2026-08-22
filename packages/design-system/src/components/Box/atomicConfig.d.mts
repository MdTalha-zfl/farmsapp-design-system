/**
 * Hand-written type surface for atomicConfig.mjs — kept as plain JS (not
 * .ts) because scripts/generate-atomic-css.mjs is a Node script that
 * imports it directly with no build step; Node's native TS type-stripping
 * turned out to silently drop named exports on this Node version (tested,
 * not assumed), so a real .ts source file wasn't a safe foundation for a
 * script every package build depends on. This .d.ts is the only place the
 * shape has to be kept in sync by hand if a field is added.
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

export const SPACE_PROPS: Record<string, SpacePropConfig>;
export const KEYWORD_PROPS: Record<string, KeywordPropConfig>;
export const TOKEN_COLOR_PROPS: Record<string, TokenColorPropConfig>;
export const TOKEN_SCALE_PROPS: Record<string, TokenScalePropConfig>;
export const RESPONSIVE_PROP_KEYS: string[];

export function className(prefix: string, value: string | number, breakpoint?: string): string;
