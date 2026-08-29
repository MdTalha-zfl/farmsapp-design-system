/**
 * Shared prop-resolution for every generated icon — a plain function, not a
 * `use*` hook. This mirrors @farmsapp/design-system's own
 * resolveTypographyClasses.ts/resolveExtraTypographyClasses (Text/Heading's
 * own resolvers) rather than Blade's real `useIconProps` hook: Blade's
 * version is a hook because it reads `theme` from React Context at render
 * time (`useTheme()`); this project's theming is 100% CSS custom properties
 * + `[data-theme]`/`[data-brand]` attribute switching, with zero JS
 * theme-context lookup anywhere — so a hook here would give a component
 * nothing a plain function call doesn't already have. See
 * decisions/decision-icon-props-plain-function-not-hook.md.
 */

// 3 named steps, not Blade's 6 — mapped onto real, already-existing
// @farmsapp/tokens spacing steps (space.2/3/4 = 16/24/32px), no new pixel
// values invented. See decisions/decision-icon-size-color-reuse-tokens.md.
export type IconSize = "small" | "medium" | "large";

// Deliberately the same 7 literal values as @farmsapp/design-system's own
// TextColor (resolveTypographyClasses.ts) — duplicated by hand, not
// imported, since packages/icons can't cleanly depend on design-system's
// internal types across the package boundary. A small, disclosed
// duplication (7 rarely-changing strings, not a growing scale) — keep this
// list in sync with TextColor by hand if it ever changes.
export type IconColor = "primary" | "secondary" | "disabled" | "inverse" | "danger" | "warning" | "success";

export interface IconOwnProps {
  /** Defaults to "medium" (24px) — Lucide's own native viewBox size, so the
   * default renders at 1:1 scale with zero scaling artifacts. */
  size?: IconSize;
  /** No default — unset lets `currentColor` inherit from an ancestor,
   * matching Text's own established "unset = inherit" convention, rather
   * than Blade's separate `'currentColor'` sentinel value (redundant once
   * "undefined = inherit" is already the rule). */
  color?: IconColor;
}

/** Resolves size/color to the fixed class names icon.css defines — no
 * style object, no CSS computation, matching every other primitive in this
 * design system's "resolve to a pre-written class name string" discipline. */
export function resolveIconClassName(size: IconSize, color: IconColor | undefined, className: string | undefined): string {
  const classes = [`ds-icon-size-${size}`];
  if (color !== undefined) classes.push(`ds-icon-color-${color}`);
  if (className) classes.push(className);
  return classes.join(" ");
}
