/**
 * Reads a token's live computed value from the cascade, rather than the
 * flattened TS constants in @farmsapp/tokens — those can't react to the
 * theme/brand attributes this catalog's toolbar toggles (see project memory
 * "TS tokens vs CSS vars": only CSS custom properties do). Called during
 * render, after the preview decorator has already set data-theme/data-brand
 * on <html> for this render pass, so each swatch always reflects the
 * currently-selected theme and brand.
 */
export function readToken(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
