import type { ReactNode } from "react";
import { useSideNavContext } from "./SideNavContext";

export interface SideNavBodyProps {
  /** SideNavLink and SideNavSection elements. */
  children: ReactNode;
}

/** The scrolling region: the only part of the nav that scrolls. An explicit
 * `role="list"` keeps list semantics in Safari/VoiceOver, which drops them
 * from a `list-style: none` list otherwise. Scrolling is suppressed while the
 * rail is collapsed — a hidden overflow has no business showing a scrollbar. */
export function SideNavBody({ children }: SideNavBodyProps) {
  const { level, isL1Collapsed, isL1Hovered } = useSideNavContext();
  const isRail = level === 1 && isL1Collapsed && !isL1Hovered;
  const className = ["ds-side-nav__body", isRail && "ds-side-nav__body--no-scroll"].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <ul role="list" className="ds-side-nav__list">
        {children}
      </ul>
    </div>
  );
}
