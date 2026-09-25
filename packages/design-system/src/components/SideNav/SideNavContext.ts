import { createContext, useContext } from "react";

export interface OnLinkActiveChangeArgs {
  title: string;
  level: number;
  isActive: boolean;
  /** A level-1 item whose `children` is a SideNavLevel. */
  isL2Trigger: boolean;
  isFirstRender: boolean;
}

export interface SideNavContextValue {
  /** 1 inside SideNavBody/SideNavFooter, 2 inside a SideNavLevel, 3 inside an
   * L3 accordion. */
  level: number;
  /** The title of the level-1 SideNavLink that opened this level — the
   * SideNavLevel's heading. Unset at level 1. */
  levelTitle?: string;
  /** L1 is collapsed to the rail: `isExpanded={false}`, or a level is open,
   * or (mobile) the L2 drawer is open. */
  isL1Collapsed: boolean;
  /** The collapsed rail is temporarily widened by hover (it then covers the
   * open level). */
  isL1Hovered: boolean;
  isMobile: boolean;
  /** Where the active L2 trigger portals its SideNavLevel. `null` until the
   * node mounts. */
  l2PortalContainer: HTMLDivElement | null;
  /** The title of the trigger whose level is open (set when one opens). */
  openLevelTitle: string | null;
  onLinkActiveChange: (args: OnLinkActiveChangeArgs) => void;
  /** Keyboard focus reaching a level-1 item while a level is open re-expands
   * L1. */
  expandL1OnFocus: () => void;
  /** Opens a trigger's level on click, even if it was already active (e.g.
   * after Back on mobile, or after keyboard focus re-expanded L1). */
  openLevel: (title: string) => void;
  /** Mobile: closes the whole menu (a leaf link was followed). */
  closeMobileNav: () => void;
}

const noop = () => {};

export const SideNavContext = createContext<SideNavContextValue>({
  level: 1,
  isL1Collapsed: false,
  isL1Hovered: false,
  isMobile: false,
  l2PortalContainer: null,
  openLevelTitle: null,
  onLinkActiveChange: noop,
  expandL1OnFocus: noop,
  openLevel: noop,
  closeMobileNav: noop,
});

export function useSideNavContext(): SideNavContextValue {
  return useContext(SideNavContext);
}
