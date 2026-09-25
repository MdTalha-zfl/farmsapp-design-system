import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FloatingFocusManager, useFloating } from "@floating-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@farmsapp/icons";
import { useId } from "@farmsapp/utilities";
import type { ButtonIconComponent } from "../Button/BaseButton";
import { SideNavContext, useSideNavContext } from "./SideNavContext";
import { SideNavLevel } from "./SideNavLevel";

export interface SideNavLinkProps {
  title: string;
  /** Description below the title — only meaningful for a level-2+ item (an
   * L1 item throws in development if given one; Blade has no room for a
   * second line on the rail). */
  description?: string;
  /** Where the link goes. With `as`, it is passed to that component as `to`
   * (React Router's `NavLink` convention, as in Blade); on a plain anchor it
   * is the `href`. Ignored when `children` is given — see below. */
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  /** A router link component, e.g. `NavLink`. Optional. */
  as?: ElementType;
  /** The consumer decides what is active — SideNav never reads the URL, so it
   * stays router-agnostic. Sets `aria-current="page"`, and — for a level-1
   * item — drives SideNav's own L1 ⇄ L2 collapse (see SideNav). */
  isActive?: boolean;
  /** Renders a non-navigating, non-focusable item with `aria-disabled`.
   * (Blade has no disabled state.) */
  isDisabled?: boolean;
  icon?: ButtonIconComponent;
  /** Non-interactive content after the title, e.g. a Badge. Hidden once
   * `children` is given — there is no room beside the chevron. */
  titleSuffix?: ReactElement;
  /** Shown on hover or keyboard focus. May be interactive (a button, a
   * Switch) — it is rendered beside the link, not inside it. Not shown for
   * an item with `children` (the chevron owns that space) or on the
   * collapsed rail. */
  trailing?: ReactElement;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Either a single `<SideNavLevel>` at level 1 — this item becomes an
   * L1 → L2 trigger, collapsing the whole nav to the rail and portalling
   * the level's content in beside it — or plain SideNavLink children at
   * level 2, which expand inline instead (an L3 accordion). `href`, `as`,
   * `target` and `onClick` are ignored either way. Nesting past level 3
   * warns in development. */
  children?: ReactNode;
  /** Whether an inline-accordion (L3, non-SideNavLevel) `children` list
   * starts open. Defaults to false. Uncontrolled. Ignored for a SideNavLevel
   * trigger (that open state lives on SideNav itself). */
  defaultIsExpanded?: boolean;
}

// A label that ellipsizes has lost information; reveal the full text as a
// native tooltip, but only when it is actually truncated.
function showTitleIfTruncated(event: MouseEvent<HTMLElement>, title: string) {
  const label = event.currentTarget.querySelector<HTMLElement>(".ds-side-nav__link-title");
  if (label && label.scrollWidth > label.clientWidth) event.currentTarget.title = title;
}

function hideTitle(event: MouseEvent<HTMLElement>) {
  event.currentTarget.removeAttribute("title");
}

const isFirstRenderDefault = true;

export function SideNavLink({
  title,
  description,
  href,
  target,
  as: Custom,
  isActive = false,
  isDisabled = false,
  icon: Icon,
  titleSuffix,
  trailing,
  onClick,
  children,
  defaultIsExpanded = false,
}: SideNavLinkProps) {
  const sideNav = useSideNavContext();
  const { level, isL1Collapsed: navIsL1Collapsed, isL1Hovered, l2PortalContainer, onLinkActiveChange } = sideNav;

  const levelElement = isValidElement(children) && children.type === SideNavLevel ? children : null;
  const isL2Trigger = level === 1 && levelElement !== null;
  const isL3Trigger = level === 2 && children !== undefined && levelElement === null;
  const hasInlineChildren = isL3Trigger;

  if (process.env.NODE_ENV !== "production") {
    if (level >= 3 && children !== undefined) {
      console.error(
        `@farmsapp/design-system: SideNavLink "${title}" — SideNav only supports nesting up to level 3, but a 4th level was found.`,
      );
    }
    if (level === 1 && description !== undefined) {
      console.error(`@farmsapp/design-system: SideNavLink "${title}" — description is not supported on a level-1 item.`);
    }
  }

  const [isOpen, setIsOpen] = useState(defaultIsExpanded);
  const sublistId = useId();

  const isRailVisuallyCollapsed = level === 1 && navIsL1Collapsed && !isL1Hovered;

  // SideNav records which trigger opened a level — on tap, or when the
  // trigger becomes active — rather than this relying on `isActive` alone,
  // so a tap opens the level even if the route hasn't marked it active yet.
  const isLevelOpen = isL2Trigger && navIsL1Collapsed && sideNav.openLevelTitle === title;
  const { refs, context: floatingContext } = useFloating({ open: isLevelOpen });

  // Reports every isActive change (not just the first) so SideNav can
  // collapse/expand L1 in response — matching Blade's onLinkActiveChange.
  const isFirstRenderRef = useRef(isFirstRenderDefault);
  useEffect(() => {
    if (level === 1) {
      onLinkActiveChange({ title, level, isActive, isL2Trigger, isFirstRender: isFirstRenderRef.current });
    }
    isFirstRenderRef.current = false;
  }, [isActive]);

  const hasTrailing = trailing !== undefined && !isDisabled && !hasInlineChildren && !isL2Trigger;
  const className = [
    "ds-side-nav__link",
    isActive && "ds-side-nav__link--active",
    isDisabled && "ds-side-nav__link--disabled",
    hasTrailing && "ds-side-nav__link--has-trailing",
    description && "ds-side-nav__link--has-description",
  ]
    .filter(Boolean)
    .join(" ");

  // On the collapsed rail the title is visually clipped, not hidden from
  // assistive tech — a mouse user still needs to see it, so the tooltip
  // shows unconditionally instead of only when the (invisible) text happens
  // to overflow.
  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    if (level !== 1 || !isRailVisuallyCollapsed) showTitleIfTruncated(event, title);
    else event.currentTarget.title = title;
  };

  const content = (
    <div className="ds-side-nav__link-body">
      <div className="ds-side-nav__link-row">
        <div className="ds-side-nav__link-row-start">
          {Icon ? <Icon size="medium" /> : null}
          <span className="ds-side-nav__link-title">{title}</span>
          {titleSuffix && !hasInlineChildren && !isL2Trigger ? <span className="ds-side-nav__link-suffix">{titleSuffix}</span> : null}
        </div>
        {hasInlineChildren ? (
          <ChevronDownIcon
            size="small"
            className={["ds-side-nav__chevron", isOpen && "ds-side-nav__chevron--open"].filter(Boolean).join(" ")}
          />
        ) : null}
        {isL2Trigger ? <ChevronRightIcon size="small" className="ds-side-nav__chevron" /> : null}
      </div>
      {level > 1 && description ? <p className="ds-side-nav__link-description">{description}</p> : null}
    </div>
  );

  // Tabbing onto any level-1 item while a level is open re-expands L1. Only
  // for keyboard focus (:focus-visible): the focus manager also restores
  // focus to the last-clicked item when the window regains focus, which
  // must not reopen L1.
  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    if (level === 1 && navIsL1Collapsed && event.currentTarget.matches(":focus-visible")) sideNav.expandL1OnFocus();
  };

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    sideNav.openLevel(title);
  };

  // On mobile, following a link closes the menu (the page is behind it).
  const handleLeafClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (sideNav.isMobile) sideNav.closeMobileNav();
  };

  const shared = {
    className,
    "aria-current": isActive ? ("page" as const) : undefined,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: hideTitle,
    onFocus: handleFocus,
  };

  let element: ReactElement;
  if (isDisabled) {
    // An anchor with no href is neither focusable nor navigable; the explicit
    // role keeps it announced as a (disabled) link.
    element = (
      <a role="link" aria-disabled="true" {...shared}>
        {content}
      </a>
    );
  } else if (isL2Trigger) {
    element = (
      <button
        ref={refs.setReference}
        type="button"
        aria-expanded={isLevelOpen}
        onClick={handleTriggerClick}
        {...shared}
      >
        {content}
      </button>
    );
  } else if (hasInlineChildren) {
    element = (
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={sublistId}
        onClick={() => setIsOpen((prev) => !prev)}
        {...shared}
      >
        {content}
      </button>
    );
  } else if (Custom) {
    element = (
      <Custom to={href} target={target} onClick={handleLeafClick} {...shared}>
        {content}
      </Custom>
    );
  } else if (href) {
    element = (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noreferrer noopener" : undefined}
        onClick={handleLeafClick}
        {...shared}
      >
        {content}
      </a>
    );
  } else {
    element = (
      <button type="button" onClick={handleLeafClick} {...shared}>
        {content}
      </button>
    );
  }

  const levelContent = <SideNavContext.Provider value={{ ...sideNav, level: 2, levelTitle: title }}>{levelElement}</SideNavContext.Provider>;

  return (
    <li className="ds-side-nav__item">
      {element}
      {hasTrailing ? <span className="ds-side-nav__trailing">{trailing}</span> : null}
      {level === 3 && isActive ? <span className="ds-side-nav__curve" aria-hidden="true" /> : null}
      {hasInlineChildren ? (
        <div className={["ds-side-nav__collapsible", isOpen && "ds-side-nav__collapsible--open"].filter(Boolean).join(" ")}>
          <ul id={sublistId} role="list" className="ds-side-nav__list ds-side-nav__sublist">
            <SideNavContext.Provider value={{ ...sideNav, level: 3 }}>{children}</SideNavContext.Provider>
          </ul>
        </div>
      ) : null}
      {isL2Trigger && isLevelOpen && l2PortalContainer
        ? createPortal(
            sideNav.isMobile ? (
              // Inside the mobile Drawer, whose own modal focus manager
              // already owns focus (and SideNav moves it to Back). A second,
              // nested manager watching this now-hidden trigger interferes
              // with it, so there is none here.
              <div className="ds-side-nav__level-portal">{levelContent}</div>
            ) : (
              <FloatingFocusManager context={floatingContext} modal={false} initialFocus={-1} returnFocus>
                <div ref={refs.setFloating} className="ds-side-nav__level-portal">
                  {levelContent}
                </div>
              </FloatingFocusManager>
            ),
            l2PortalContainer,
          )
        : null}
    </li>
  );
}
