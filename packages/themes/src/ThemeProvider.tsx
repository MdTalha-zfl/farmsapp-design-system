"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY, BRAND_STORAGE_KEY } from "./bootstrap";

export type Theme = "light" | "dark";
// Not a literal union of known brand ids — that would make this package own
// a brand registry, which is explicitly Phase 12 scope. `null` means "no
// override, use the default primitives"; any non-null string is passed
// straight through to data-brand, and it's on the CSS side (tokens.brand)
// whether a [data-brand="..."] selector actually exists for it. Right now
// that's exactly one value, "pilot" — see Theme Runtime Chunk 05.
export type Brand = string | null;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  // Reads whatever the pre-paint bootstrap script (see bootstrap.ts) already
  // set on <html data-theme>, rather than recomputing it from localStorage/
  // matchMedia again here. The DOM attribute is the single source of truth
  // by the time React mounts — recomputing risks disagreeing with it (e.g.
  // if a consumer's bootstrap script is missing or runs with stale state).
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function readInitialBrand(): Brand {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute("data-brand");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);
  const [brand, setBrandState] = useState<Brand>(readInitialBrand);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can throw in private-browsing/sandboxed contexts. The
      // attribute is already set, so the theme still applies for this
      // session — it just won't persist across reloads.
    }
    setThemeState(next);
  }, []);

  const setBrand = useCallback((next: Brand) => {
    if (next) {
      document.documentElement.setAttribute("data-brand", next);
    } else {
      document.documentElement.removeAttribute("data-brand");
    }
    try {
      if (next) {
        localStorage.setItem(BRAND_STORAGE_KEY, next);
      } else {
        localStorage.removeItem(BRAND_STORAGE_KEY);
      }
    } catch {
      // Same as setTheme — attribute already applied for this session
      // regardless of whether persisting it succeeded.
    }
    setBrandState(next);
  }, []);

  useEffect(() => {
    // Only auto-follow the OS preference if the user hasn't made an
    // explicit choice yet — an explicit choice must never be silently
    // overridden by a later system-level change. Brand has no OS-level
    // signal to follow, so this listener only ever concerns theme.
    let hasExplicitChoice = false;
    try {
      hasExplicitChoice = localStorage.getItem(THEME_STORAGE_KEY) !== null;
    } catch {
      hasExplicitChoice = false;
    }
    if (hasExplicitChoice) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      const next = event.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setThemeState(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // The "zero re-render" claim (see Blade comparison, project memory) is
  // specifically that theme-aware *styling* costs nothing — components read
  // CSS custom properties, the cascade does the work, nothing subscribes to
  // theme to re-render its styles. useTheme() itself is a normal context
  // value for components that need the theme for *logic* (e.g. a toggle
  // button's icon) — those consumers re-rendering on theme change is
  // expected and fine; memoizing here just avoids handing out a new object
  // identity on every unrelated render of ThemeProvider itself.
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, brand, setBrand }),
    [theme, setTheme, brand, setBrand],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
