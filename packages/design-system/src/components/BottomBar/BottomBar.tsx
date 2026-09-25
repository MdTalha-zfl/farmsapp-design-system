import type { ReactNode } from "react";

export interface BottomBarProps {
  /** Usually one or two full-width Buttons. */
  children: ReactNode;
  /** Names the region for screen readers — say what the actions are for
   * ("Payment actions"). */
  accessibilityLabel?: string;
  /** Overrides the default sticky-tier stacking order, same as BottomNav. */
  zIndex?: number;
}

/**
 * A bar fixed to the bottom of the viewport that holds a screen's main
 * actions. It is `position: fixed`, so it does not take up space in the page:
 * give the scrolling content enough bottom padding that its last item isn't
 * hidden behind the bar. See decisions/decision-bottombar-api-and-structure.md.
 */
export function BottomBar({ children, accessibilityLabel, zIndex }: BottomBarProps) {
  return (
    <div
      role="group"
      aria-label={accessibilityLabel}
      className="ds-bottom-bar"
      style={zIndex === undefined ? undefined : { zIndex }}
    >
      {children}
    </div>
  );
}
