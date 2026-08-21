export const THEME_STORAGE_KEY = "ds-theme";
export const BRAND_STORAGE_KEY = "ds-brand";

/**
 * Source for a synchronous, render-blocking script. Must run in the
 * consuming app's document <head>, before first paint — it cannot be a
 * React effect. React only runs after the browser has already parsed the
 * document and started painting with whatever attributes are present in the
 * markup; setting data-theme/data-brand inside a useEffect leaves a real,
 * visible gap where the wrong theme/brand renders first. This is exactly
 * the failure mode the Blade comparison found undocumented and unmitigated
 * in their own provider. This package deliberately does not inline this
 * into any HTML document itself — Next.js, a plain Vite index.html, and a
 * real downstream product app each need it wired in differently (a
 * beforeInteractive Script, a literal <script> tag, a server-rendered
 * layout's <head>), and that's the consuming app's concern, not this
 * package's.
 *
 * Brand has no equivalent of prefers-color-scheme — there's no OS-level
 * signal for "which white-label brand." Absent an explicit stored choice,
 * data-brand is simply left unset, which is exactly what the default
 * (non-overridden) brand primitives already need — no attribute, no
 * [data-brand="..."] selector in tokens.brand matches, tokens.primitive's
 * unconditional values are just what applies.
 */
export function getThemeInitScript(): string {
  return `(function(){try{var tk=${JSON.stringify(THEME_STORAGE_KEY)};var ts=localStorage.getItem(tk);var t=ts==="light"||ts==="dark"?ts:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);var bk=${JSON.stringify(BRAND_STORAGE_KEY)};var b=localStorage.getItem(bk);if(b){document.documentElement.setAttribute("data-brand",b);}}catch(e){}})();`;
}
