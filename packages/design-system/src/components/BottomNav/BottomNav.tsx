import { Children, type ReactNode } from "react";

export type BottomNavProps = {
  /** 2 to 5 BottomNavItem elements. */
  children: ReactNode;
  /** Accessible name for the navigation landmark. */
  "aria-label"?: string;
  /** Overrides the default sticky-tier stacking order. */
  zIndex?: number;
};

const MIN_ITEMS = 2;
const MAX_ITEMS = 5;

export function BottomNav({ children, "aria-label": ariaLabel = "Primary", zIndex }: BottomNavProps) {
  if (process.env.NODE_ENV !== "production") {
    const count = Children.toArray(children).length;
    if (count < MIN_ITEMS || count > MAX_ITEMS) {
      throw new Error(`BottomNav: children cannot be fewer than ${MIN_ITEMS} or more than ${MAX_ITEMS} (got ${count}).`);
    }
  }

  return (
    <nav className="ds-bottom-nav" aria-label={ariaLabel} style={zIndex === undefined ? undefined : { zIndex }}>
      {children}
    </nav>
  );
}
