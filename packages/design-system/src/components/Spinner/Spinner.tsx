import { LoaderCircleIcon } from "@farmsapp/icons";
import { resolveBoxClassNames, type MarginProps } from "../Box/Box";

/**
 * Spinner — a Phase 7 prerequisite pulled in specifically for Button's
 * `isLoading` state, same pattern as Icon/VisuallyHidden being pulled in
 * once Button's real dependency on them became concrete. Deliberately
 * minimal: just enough for an overlay-and-hide-content loading indicator,
 * not a general-purpose Spinner API.
 *
 * Wraps @farmsapp/icons' existing LoaderCircleIcon (Lucide's open-arc
 * spinner glyph) rather than hand-authoring new SVG — the icon itself stays
 * `aria-hidden="true"` (hardcoded by the icon generator, decorative), and
 * this component's own `role="status"` + `aria-label` carries the real
 * accessible name, matching Blade's real BaseSpinner's `accessibilityLabel`
 * prop shape, translated onto this project's established "required
 * accessibilityLabel -> aria-label, not VisuallyHidden" precedent for
 * icon-only accessible naming (see decisions/decision-icon-aria-hidden-unconditional.md).
 *
 * `role="status"` is a deliberately smaller substitute for Blade's real
 * `usePrevious`/`announce()` loading-transition live-announcements — this
 * project has no LiveAnnouncer utility yet. See
 * decisions/decision-button-defers-live-announcer.md for the real,
 * explicitly-flagged gap this leaves (a static `role="status"` region
 * reliably announces content changes, not simply mount/unmount, which is
 * exactly how Button's isLoading toggles it).
 */

export type SpinnerSize = "small" | "medium" | "large";

export interface SpinnerProps extends MarginProps {
  /** Default "medium" — matches @farmsapp/icons' IconSize scale exactly. */
  size?: SpinnerSize;
  /** Required, no default — matches Blade's real BaseSpinner. */
  accessibilityLabel: string;
}

// Blade's own real BaseSpinner wraps its output in an extra BaseBox and
// spreads getStyledProps(styledProps) onto it, for exactly this reason —
// confirmed directly from source. See decisions/decision-margin-props-shared-across-components.md
// for why this project reuses resolveBoxClassNames directly on the existing
// root element instead of introducing a second wrapper element the way
// Blade's runtime-styled Box requires.
export function Spinner({ size = "medium", accessibilityLabel, ...marginProps }: SpinnerProps) {
  const classes = ["ds-spinner", ...resolveBoxClassNames(marginProps)].join(" ");
  return (
    <span role="status" aria-label={accessibilityLabel} className={classes}>
      <LoaderCircleIcon size={size} className="ds-spinner__icon" />
    </span>
  );
}
