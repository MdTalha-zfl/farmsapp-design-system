/**
 * Pure snap/release math for BottomSheet — no DOM, no React. Kept separate
 * from useSheetDrag so it can be unit-tested directly and reused by a
 * future native variant. See decisions/decision-bottomsheet-api-and-structure.md.
 *
 * Everything here works in "visible height" pixels: how much of the sheet is
 * on screen. 0 means fully off-screen (dismissed).
 */

export const DEFAULT_SNAP_POINTS: readonly number[] = [0.35, 0.5, 0.85];

/** How far ahead (ms) a release velocity is projected when picking a stop. */
export const PROJECTION_MS = 150;

/** Release projected below this fraction of the lowest stop dismisses. */
export const DISMISS_FRACTION = 0.4;

/** Hard cap (px) on how far the sheet can be dragged past its bounds. */
export const OVERDRAG_LIMIT_PX = 80;

/** Damping applied to drag distance past the bounds (matches Blade's 0.55). */
export const RUBBER_BAND_DAMPING = 0.55;

export interface NormalizedSnapPoints {
  points: number[];
  /** Human-readable problems found in the input, for a dev-mode warning. */
  issues: string[];
}

/**
 * Validates and cleans a `snapPoints` prop: drops non-finite values, clamps
 * to (0, 1], sorts ascending, removes duplicates. Falls back to the default
 * when nothing usable is left. Never throws — bad input degrades, matching
 * this project's warn-and-degrade convention.
 */
export function normalizeSnapPoints(input: readonly number[] | undefined): NormalizedSnapPoints {
  if (input === undefined) return { points: [...DEFAULT_SNAP_POINTS], issues: [] };

  const issues: string[] = [];
  const finite = input.filter((p) => Number.isFinite(p));
  if (finite.length !== input.length) issues.push("snapPoints contained non-numeric values, which were dropped");

  const clamped = finite.map((p) => Math.min(1, Math.max(0.05, p)));
  if (clamped.some((p, i) => p !== finite[i])) issues.push("snapPoints must be fractions between 0 and 1; out-of-range values were clamped");

  const sorted = [...new Set(clamped)].sort((a, b) => a - b);
  if (sorted.length !== clamped.length || sorted.some((p, i) => p !== clamped[i])) {
    issues.push("snapPoints must be unique and in ascending order; they were sorted and de-duplicated");
  }

  if (sorted.length === 0) {
    issues.push("snapPoints was empty; using the default [0.35, 0.5, 0.85]");
    return { points: [...DEFAULT_SNAP_POINTS], issues };
  }
  return { points: sorted, issues };
}

/**
 * Converts fractional snap points into visible-height stops for a panel of
 * the given natural height. A stop can never exceed the panel itself, so a
 * short sheet is shorter than its snap point (content-fit), and snap points
 * that all exceed the panel collapse into one stop.
 */
export function computeStops(panelHeight: number, viewportHeight: number, snapPoints: readonly number[]): number[] {
  if (panelHeight <= 0 || viewportHeight <= 0) return [];
  const raw = snapPoints.map((p) => Math.min(panelHeight, p * viewportHeight));
  const stops: number[] = [];
  for (const height of raw) {
    const last = stops[stops.length - 1];
    if (last === undefined || height - last >= 1) stops.push(height);
  }
  return stops;
}

export function nearestStopIndex(visibleHeight: number, stops: readonly number[]): number {
  let best = 0;
  let bestDistance = Infinity;
  stops.forEach((stop, i) => {
    const distance = Math.abs(stop - visibleHeight);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

/**
 * Which stop the sheet opens at: the one nearest to the middle snap point.
 * Deliberately differs from Blade in one case — when content fits between
 * the lowest and middle snap points, this opens at the stop showing all of
 * it (Blade opens at the lowest, leaving content clipped and scrollable
 * even though it would have fit).
 */
export function initialStopIndex(stops: readonly number[], snapPoints: readonly number[], viewportHeight: number): number {
  if (stops.length <= 1) return 0;
  const middle = snapPoints[Math.floor((snapPoints.length - 1) / 2)] ?? snapPoints[0] ?? 0.5;
  return nearestStopIndex(middle * viewportHeight, stops);
}

/**
 * Resists dragging past [min, max]: the further past the edge, the less the
 * sheet follows the pointer, up to OVERDRAG_LIMIT_PX. Inside the range the
 * position is returned unchanged.
 */
export function applyRubberBand(position: number, min: number, max: number): number {
  if (position > max) {
    const overshoot = position - max;
    return max + OVERDRAG_LIMIT_PX * (1 - Math.exp((-overshoot * RUBBER_BAND_DAMPING) / OVERDRAG_LIMIT_PX));
  }
  if (position < min) {
    const overshoot = min - position;
    return min - OVERDRAG_LIMIT_PX * (1 - Math.exp((-overshoot * RUBBER_BAND_DAMPING) / OVERDRAG_LIMIT_PX));
  }
  return position;
}

export type ReleaseResult = { kind: "snap"; index: number } | { kind: "dismiss" };

/**
 * Decides where the sheet goes when the pointer is released.
 *
 * `velocity` is in px/ms and positive when the sheet is growing (moving up),
 * negative when shrinking. The release position is projected forward by
 * PROJECTION_MS, so a fast flick carries the sheet past where the finger
 * stopped. One rule covers both slow drags and flicks: if the projected
 * position falls below DISMISS_FRACTION of the lowest stop, dismiss;
 * otherwise snap to the nearest stop. (Blade instead compares the *raw*
 * release position, so a fast flick down snaps but never dismisses.)
 */
export function resolveRelease(params: {
  visibleHeight: number;
  velocity: number;
  stops: readonly number[];
  isDismissible: boolean;
}): ReleaseResult {
  const { visibleHeight, velocity, stops, isDismissible } = params;
  const lowest = stops[0] ?? 0;
  const highest = stops[stops.length - 1] ?? 0;
  const projected = Math.min(highest, visibleHeight + velocity * PROJECTION_MS);

  if (isDismissible && projected < lowest * (1 - DISMISS_FRACTION)) return { kind: "dismiss" };
  return { kind: "snap", index: nearestStopIndex(Math.max(projected, lowest), stops) };
}

/** Keyboard step between stops, clamped to the ends. */
export function stepStopIndex(current: number, direction: "up" | "down", count: number): number {
  const next = direction === "up" ? current + 1 : current - 1;
  return Math.min(count - 1, Math.max(0, next));
}
