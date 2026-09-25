import { Children, isValidElement, useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Drawer } from "../Drawer/Drawer";
import { DrawerHeader } from "../Drawer/DrawerHeader";
import { DrawerBody } from "../Drawer/DrawerBody";
import { IconButton } from "../IconButton/IconButton";
import { ChevronLeftIcon } from "@farmsapp/icons";
import { useMediaQuery } from "../../utils/useMediaQuery";
import { SideNavContext, type OnLinkActiveChangeArgs } from "./SideNavContext";
import { SideNavHeader } from "./SideNavHeader";

// Blade's timings (SideNav/tokens.ts).
const L1_EXIT_HOVER_DELAY = 150;
// After an L2 trigger is clicked the pointer is still on the rail; without
// this, that same hover would immediately widen the rail back over the level.
const HOVER_AGAIN_DELAY = 500;
const TRANSITION_CLEANUP_DELAY = 300;
// Blade's mobile threshold: below its `m` breakpoint.
const MOBILE_QUERY = "(max-width: 767px)";

export interface SideNavProps {
  /** SideNavHeader (optional), SideNavBody and SideNavFooter. */
  children: ReactNode;
  /** Names the navigation landmark. Defaults to "Main". (Blade sets none.) */
  accessibilityLabel?: string;
  /** The id of the page's main content; adds a "Skip to content" link,
   * revealed on keyboard focus. */
  skipToContentId?: string;
  /** Mobile only: whether the L1 drawer is open. */
  isOpen?: boolean;
  /** Mobile only. Passing it (below 768px) turns SideNav into a Drawer that
   * you open with `isOpen`; fires on close, Escape, the overlay, or when a
   * link is followed. Without it, the desktop rail renders at any width. */
  onDismiss?: () => void;
  /** Desktop only. `true` (the default): full width, collapsing to the rail
   * while a level is open. `false`: always the rail, with no hover
   * expansion and no level panel. SideNav has no toggle button of its own. */
  isExpanded?: boolean;
  onExpandChange?: (args: { isExpanded: boolean }) => void;
  onExpandTransitionEnd?: (args: { isExpanded: boolean }) => void;
  /** 1 while the L1 list is visible, 2 while a level is showing. */
  onVisibleLevelChange?: (args: { visibleLevel: 1 | 2 }) => void;
  /** Pinned above the nav, e.g. an activation panel. Desktop only. Avoid
   * promotional content here. */
  banner?: ReactElement;
  /** Overrides the sticky-tier stacking order. */
  zIndex?: number;
}

/**
 * A navigation rail fixed to the start edge, with up to three levels: L1,
 * L2 (a SideNavLevel under a level-1 SideNavLink) and L3 (an inline
 * accordion inside L2).
 *
 * The nav's width depends only on `isExpanded`: 240px, or the 56px rail.
 * Opening a level never changes it. The level panel spans the nav's full
 * width *behind* L1, and L1 shrinks to the rail on top of it, leaving the
 * panel the other 184px. Hovering the rail widens L1 back over the panel
 * until the pointer leaves. Offset page content by
 * `--ds-layout-side-nav-width-expanded` (or `-collapsed` when
 * `isExpanded={false}`). See decisions/decision-sidenav-scope-and-phasing.md.
 */
export function SideNav({
  children,
  accessibilityLabel = "Main",
  skipToContentId,
  isOpen,
  onDismiss,
  isExpanded = true,
  onExpandChange,
  onExpandTransitionEnd,
  onVisibleLevelChange,
  banner,
  zIndex,
}: SideNavProps) {
  // Mobile mode needs both a small screen and `onDismiss`; without it the
  // rail renders at any width, and must behave as the rail.
  const isMobile = useMediaQuery(MOBILE_QUERY) && onDismiss !== undefined;
  const isSideNavCollapsed = !isExpanded;

  const [isL1Collapsed, setIsL1Collapsed] = useState(false);
  const [isL1Hovered, setIsL1Hovered] = useState(false);
  const [isHoverAgainEnabled, setIsHoverAgainEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileL2Open, setIsMobileL2Open] = useState(false);
  // Which trigger's level is open. Tracked here rather than inferred from the
  // trigger's `isActive` alone, so a tap opens the level even before (or
  // without) the consumer's route marking the trigger active.
  const [openLevelTitle, setOpenLevelTitle] = useState<string | null>(null);
  const [l2PortalContainer, setL2PortalContainer] = useState<HTMLDivElement | null>(null);

  const exitHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevIsSideNavCollapsedRef = useRef<boolean | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(exitHoverTimeoutRef.current);
      timeoutIdsRef.current.forEach(clearTimeout);
    },
    [],
  );

  const later = useCallback((callback: () => void, ms: number) => {
    timeoutIdsRef.current.push(setTimeout(callback, ms));
  }, []);

  // The transition class is cleared by a timer rather than transitionend
  // alone, which never fires if the width didn't actually change.
  const startL1Transition = useCallback(() => {
    setIsTransitioning(true);
    later(() => setIsTransitioning(false), TRANSITION_CLEANUP_DELAY);
  }, [later]);

  const collapseL1 = useCallback(
    (title: string) => {
      setOpenLevelTitle(title);
      if (isMobile) {
        setIsMobileL2Open(true);
        onVisibleLevelChange?.({ visibleLevel: 2 });
        return;
      }
      if (!isL1Collapsed) {
        setIsL1Collapsed(true);
        onVisibleLevelChange?.({ visibleLevel: 2 });
      }
    },
    [isMobile, isL1Collapsed, onVisibleLevelChange],
  );

  const expandL1 = useCallback(() => {
    if (isMobile) {
      setIsMobileL2Open(false);
      onVisibleLevelChange?.({ visibleLevel: 1 });
      return;
    }
    if (isSideNavCollapsed || !isL1Collapsed) return;
    setIsL1Collapsed(false);
    if (!isL1Hovered) onVisibleLevelChange?.({ visibleLevel: 1 });
  }, [isMobile, isSideNavCollapsed, isL1Collapsed, isL1Hovered, onVisibleLevelChange]);

  // Every level-1 SideNavLink reports its isActive changes: an active L2
  // trigger opens its level, any other active level-1 item closes it.
  // A level opened by the user (not on mount): animate, and keep the pointer
  // still resting on the rail from immediately widening it back.
  const openLevel = useCallback(
    (title: string) => {
      collapseL1(title);
      if (isMobile) return;
      startL1Transition();
      clearTimeout(exitHoverTimeoutRef.current);
      setIsL1Hovered(false);
      setIsHoverAgainEnabled(false);
      later(() => setIsHoverAgainEnabled(true), HOVER_AGAIN_DELAY);
    },
    [collapseL1, isMobile, later, startL1Transition],
  );

  const onLinkActiveChange = useCallback(
    (args: OnLinkActiveChangeArgs) => {
      if (args.level !== 1 || !args.isActive) return;
      if (!args.isL2Trigger) expandL1();
      else if (args.isFirstRender) collapseL1(args.title);
      else openLevel(args.title);
    },
    [collapseL1, expandL1, openLevel],
  );

  const expandL1OnFocus = useCallback(() => {
    if (!isSideNavCollapsed && isL1Collapsed) setIsL1Collapsed(false);
  }, [isSideNavCollapsed, isL1Collapsed]);

  useEffect(() => {
    if (isSideNavCollapsed && isL1Hovered) setIsL1Hovered(false);
  }, [isSideNavCollapsed, isL1Hovered]);

  // Mobile: the trigger that opened the level is now hidden, so move focus
  // to Back rather than let it fall to the page. Leaving the level returns
  // focus to the trigger (the level's focus manager does that).
  useEffect(() => {
    if (isMobile && isMobileL2Open) backButtonRef.current?.focus();
  }, [isMobile, isMobileL2Open]);

  // onExpandChange fires only when the prop flips, not on mount.
  useEffect(() => {
    const prev = prevIsSideNavCollapsedRef.current;
    prevIsSideNavCollapsedRef.current = isSideNavCollapsed;
    if (isMobile || prev === undefined || prev === isSideNavCollapsed) return;
    startL1Transition();
    onExpandChange?.({ isExpanded: !isSideNavCollapsed });
  }, [isMobile, isSideNavCollapsed, onExpandChange, startL1Transition]);

  // `onMouseOver` + `onMouseLeave`, not a matched pair: the level is a portal
  // child of an L1 link, so React bubbles its events up through L1.
  // mouseenter doesn't propagate and can't be stopped, so hovering the level
  // would count as hovering L1. mouseover can be stopped, and SideNavLevel
  // stops it. (Blade's own workaround.)
  const handleMouseOver = () => {
    if (isSideNavCollapsed) return;
    clearTimeout(exitHoverTimeoutRef.current);
    if (isL1Collapsed && isHoverAgainEnabled && !isL1Hovered) {
      setIsL1Hovered(true);
      onVisibleLevelChange?.({ visibleLevel: 1 });
    }
  };

  const handleMouseLeave = () => {
    if (isSideNavCollapsed || !isL1Collapsed || !isL1Hovered) return;
    exitHoverTimeoutRef.current = setTimeout(() => {
      setIsL1Hovered(false);
      startL1Transition();
      onVisibleLevelChange?.({ visibleLevel: 2 });
    }, L1_EXIT_HOVER_DELAY);
  };

  const effectiveIsL1Collapsed = isMobile ? isMobileL2Open : isSideNavCollapsed || isL1Collapsed;
  const effectiveIsL1Hovered = !isSideNavCollapsed && isL1Hovered;

  const closeMobileNav = useCallback(() => {
    setIsMobileL2Open(false);
    onDismiss?.();
  }, [onDismiss]);

  const contextValue = {
    level: 1,
    isL1Collapsed: effectiveIsL1Collapsed,
    isL1Hovered: effectiveIsL1Hovered,
    isMobile,
    l2PortalContainer,
    openLevelTitle,
    onLinkActiveChange,
    expandL1OnFocus,
    openLevel,
    closeMobileNav,
  };

  if (isMobile) {
    // One Drawer whose content swaps between L1 and the open level (Blade
    // stacks two, but Drawer has no stacking yet, and two modal drawers would
    // fight over focus). L1 stays mounted while hidden: the level is a portal
    // child of its trigger link.
    return (
      <SideNavContext.Provider value={contextValue}>
        <Drawer isOpen={isOpen ?? false} onDismiss={closeMobileNav} accessibilityLabel={accessibilityLabel}>
          <DrawerHeader
            title={isMobileL2Open && openLevelTitle ? openLevelTitle : "Main Menu"}
            leading={
              isMobileL2Open ? (
                <IconButton ref={backButtonRef} icon={ChevronLeftIcon} size="small" emphasis="subtle" accessibilityLabel="Back" onClick={expandL1} />
              ) : null
            }
          />
          <DrawerBody>
            <div className="ds-side-nav__l1 ds-side-nav__l1--mobile" hidden={isMobileL2Open}>
              {children}
            </div>
            <div ref={setL2PortalContainer} className="ds-side-nav__l2 ds-side-nav__l2--mobile" hidden={!isMobileL2Open} />
          </DrawerBody>
        </Drawer>
      </SideNavContext.Provider>
    );
  }

  // The header spans the whole nav, above both layers, so it stays in place
  // while a level is open; only the body and footer shrink to the rail.
  const childArray = Children.toArray(children);
  const header = childArray.find((child) => isValidElement(child) && child.type === SideNavHeader);
  const l1Children = header ? childArray.filter((child) => child !== header) : children;

  const navClassName = ["ds-side-nav", isSideNavCollapsed && "ds-side-nav--collapsed"].filter(Boolean).join(" ");
  const l1ClassName = [
    "ds-side-nav__l1",
    effectiveIsL1Collapsed && !effectiveIsL1Hovered && "ds-side-nav__l1--collapsed",
    effectiveIsL1Collapsed && effectiveIsL1Hovered && "ds-side-nav__l1--peeking",
    isTransitioning && "ds-side-nav__l1--transitioning",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <SideNavContext.Provider value={contextValue}>
      <nav aria-label={accessibilityLabel} className={navClassName} style={zIndex === undefined ? undefined : { zIndex }}>
        {banner ? <div className="ds-side-nav__banner">{banner}</div> : null}
        {header}
        <div className="ds-side-nav__main">
          <div ref={setL2PortalContainer} className="ds-side-nav__l2" />
          <div
            className={l1ClassName}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            onTransitionEnd={(event) => {
              if (event.target === event.currentTarget && event.propertyName === "width") {
                onExpandTransitionEnd?.({ isExpanded: !isSideNavCollapsed });
              }
            }}
          >
            {skipToContentId ? (
              <a className="ds-side-nav__skip" href={`#${skipToContentId}`}>
                Skip to content
              </a>
            ) : null}
            {l1Children}
          </div>
        </div>
      </nav>
    </SideNavContext.Provider>
  );
}
