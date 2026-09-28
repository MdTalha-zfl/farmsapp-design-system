/**
 * SpotlightPopoverTourMask — the full-viewport SVG cutout that dims everything except the
 * active step's target. See decisions/decision-tour-api-and-structure.md.
 *
 * `resolveSpotlightTarget`/`readTargetRadius` are SpotlightPopoverTour-specific (mirrors
 * Blade keeping the equivalent utilities out of any shared package) —
 * kept in this file rather than a package-wide utility, matching
 * decisions/decision-per-component-folder-structure.md.
 */

const MASK_ID = "ds-spotlight-popover-tour-mask";

/** Breathing room around the measured target rect, in px — matches the
 * project's own 8px spacing base (half a step), not an arbitrary number. */
export const SPOTLIGHT_POPOVER_TOUR_MASK_PADDING = 4;

function hasOwnPaintedShape(style: CSSStyleDeclaration): boolean {
  const hasBackground = style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent";
  const hasBorder = parseFloat(style.borderTopWidth) > 0 || parseFloat(style.borderLeftWidth) > 0;
  const hasRadius = parseFloat(style.borderTopLeftRadius) > 0;
  return hasBackground || hasBorder || hasRadius;
}

// Bounded so an unshaped leaf never walks all the way up to something
// unrelated (e.g. a page-level layout div that happens to have a
// background) — a form control's actual bordered container is always a
// couple of levels away at most (see the input.css case below).
const MAX_ANCESTOR_SEARCH_DEPTH = 4;

/**
 * Finds the DOM element that actually LOOKS like the target, when the
 * ref'd element itself isn't it. Two real cases, in opposite directions:
 *
 * - **Upward**: a form control's ref often lands on a bare interactive leaf
 *   — e.g. this project's own `TextInput` forwards its ref straight to the
 *   `<input>`, which is deliberately unstyled (`border: none; background:
 *   transparent` in input.css) — the actual visible bordered field is a
 *   nearby *ancestor*. Walking up a short, bounded distance finds it.
 * - **Downward**: the opposite shape — an unshaped wrapper (e.g. a
 *   flex-stretch layout div a consumer wrapped their own target in) around
 *   exactly one child that IS the shaped element meant to be spotlighted.
 */
export function resolveSpotlightTarget(el: HTMLElement): HTMLElement {
  if (hasOwnPaintedShape(getComputedStyle(el))) return el;

  let ancestor = el.parentElement;
  for (let depth = 0; ancestor && depth < MAX_ANCESTOR_SEARCH_DEPTH; depth += 1) {
    if (hasOwnPaintedShape(getComputedStyle(ancestor))) return ancestor;
    ancestor = ancestor.parentElement;
  }

  if (el.children.length === 1 && el.children[0] instanceof HTMLElement) {
    return resolveSpotlightTarget(el.children[0]);
  }
  return el;
}

function readCssPixelVar(varName: string, fallbackPx: number): number {
  if (typeof document === "undefined") return fallbackPx;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? fallbackPx : parsed;
}

/**
 * The cutout takes the target's own border-radius, so it reads as a halo
 * hugging the element rather than a generic box drawn over it. Falls back
 * to the shared "large" radius token only when the target paints no
 * corner of its own (e.g. plain text).
 */
export function readTargetRadius(el: HTMLElement): number {
  const style = getComputedStyle(el);
  if (!hasOwnPaintedShape(style)) return readCssPixelVar("--ds-radius-lg", 12);
  return parseFloat(style.borderTopLeftRadius) || 0;
}

export interface SpotlightPopoverTourMaskProps {
  rect: DOMRect | null;
  radius: number;
  opacity: number;
}

export function SpotlightPopoverTourMask({ rect, radius, opacity }: SpotlightPopoverTourMaskProps) {
  const hasTarget = rect !== null && rect.width > 0 && rect.height > 0;
  const cutoutProps = hasTarget
    ? {
        x: rect.x - SPOTLIGHT_POPOVER_TOUR_MASK_PADDING,
        y: rect.y - SPOTLIGHT_POPOVER_TOUR_MASK_PADDING,
        width: rect.width + SPOTLIGHT_POPOVER_TOUR_MASK_PADDING * 2,
        height: rect.height + SPOTLIGHT_POPOVER_TOUR_MASK_PADDING * 2,
        rx: radius,
      }
    : null;

  return (
    <svg className="ds-spotlight-popover-tour__mask" style={{ opacity }} width="100%" height="100%" aria-hidden="true">
      <defs>
        <mask id={MASK_ID}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {cutoutProps && <rect {...cutoutProps} fill="black" />}
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="var(--ds-color-surface-overlay)" mask={`url(#${MASK_ID})`} />
      {cutoutProps && (
        <rect {...cutoutProps} className="ds-spotlight-popover-tour__pulse" fill="none" stroke="var(--ds-color-focus-ring)" strokeWidth={2} />
      )}
    </svg>
  );
}
