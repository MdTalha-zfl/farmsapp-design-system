import type { ReactElement, ReactNode } from "react";
import { useSideNavContext } from "./SideNavContext";

export interface SideNavLevelProps {
  /** SideNavLink elements — this level's own list. A SideNavLink here with
   * its own (plain, non-SideNavLevel) `children` becomes an inline
   * accordion (L3), not another level. */
  children: ReactNode;
  titleSuffix?: ReactElement;
}

/**
 * A second navigation level: `<SideNavLink title="Settings"><SideNavLevel>
 * ...</SideNavLevel></SideNavLink>`. While that link is active, the level is
 * portalled into the panel behind the collapsed rail. Its heading is the
 * link's `title`.
 */
export function SideNavLevel({ children, titleSuffix }: SideNavLevelProps) {
  const { levelTitle, isMobile } = useSideNavContext();

  return (
    <div
      className="ds-side-nav__level"
      // React bubbles events from a portal up its React parents, so without
      // this, hovering the level would count as hovering L1 and widen the
      // rail over it (see SideNav's handleMouseOver).
      onMouseOver={(event) => event.stopPropagation()}
      onMouseOut={(event) => event.stopPropagation()}
    >
      {/* On mobile the L2 Drawer's header carries the title. */}
      {levelTitle && !isMobile ? (
        <div className="ds-side-nav__level-header">
          <p className="ds-side-nav__level-title">{levelTitle}</p>
          {titleSuffix}
        </div>
      ) : null}
      <div className="ds-side-nav__level-body">
        <ul role="list" aria-label={levelTitle} className="ds-side-nav__list">
          {children}
        </ul>
      </div>
    </div>
  );
}
