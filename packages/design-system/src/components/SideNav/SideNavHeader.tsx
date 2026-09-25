import type { ReactElement, ReactNode } from "react";

export interface SideNavHeaderProps {
  /** A logo or brand mark, about 32px. The only part shown on the collapsed
   * rail, so give it an accessible name (e.g. `alt` on an `<img>`). */
  leading?: ReactElement;
  /** Product or workspace name. */
  title?: ReactNode;
  /** A second line, e.g. the account or environment. */
  subtitle?: ReactNode;
  /** An action beside the title, e.g. a workspace switcher. Hidden when the
   * whole nav is collapsed (`isExpanded={false}`) — so a control that
   * re-expands the nav doesn't belong here (put it in SideNavFooter). */
  trailing?: ReactElement;
}

/**
 * `<SideNav><SideNavHeader /><SideNavBody /><SideNavFooter /></SideNav>`.
 * SideNav renders it across the whole nav, above the body: it stays in
 * place, full width, while a level is open (only the body and footer shrink
 * to the rail). With `isExpanded={false}` only `leading` shows.
 */
export function SideNavHeader({ leading, title, subtitle, trailing }: SideNavHeaderProps) {
  return (
    <div className="ds-side-nav__header">
      {leading ? <span className="ds-side-nav__header-leading">{leading}</span> : null}
      {title || subtitle ? (
        <span className="ds-side-nav__header-text">
          {title ? <span className="ds-side-nav__header-title">{title}</span> : null}
          {subtitle ? <span className="ds-side-nav__header-subtitle">{subtitle}</span> : null}
        </span>
      ) : null}
      {trailing ? <span className="ds-side-nav__header-trailing">{trailing}</span> : null}
    </div>
  );
}
