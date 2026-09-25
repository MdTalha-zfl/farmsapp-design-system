import type { ReactNode } from "react";

export interface SideNavFooterProps {
  /** SideNavLink and SideNavSection elements. */
  children: ReactNode;
}

/** Pinned below the scrolling body, so it stays visible however long the
 * body is. */
export function SideNavFooter({ children }: SideNavFooterProps) {
  return (
    <div className="ds-side-nav__footer">
      <ul role="list" className="ds-side-nav__list">
        {children}
      </ul>
    </div>
  );
}
