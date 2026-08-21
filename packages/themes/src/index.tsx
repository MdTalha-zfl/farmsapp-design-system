/**
 * ThemeProvider — light/dark via data-theme (Chunk 04), brand overrides via
 * data-brand (Chunk 05). See System Blueprint §06.
 */
export { ThemeProvider, useTheme, type Theme, type Brand } from "./ThemeProvider";
export { getThemeInitScript, THEME_STORAGE_KEY, BRAND_STORAGE_KEY } from "./bootstrap";
