import { useLayoutEffect, type ReactNode } from "react";
import { FloatingFocusManager, FloatingPortal, type OffsetOptions } from "@floating-ui/react";
import { useMenuContext } from "./MenuContext";

export interface MenuOverlayProps {
  /** MenuItems, dividers, a header, a footer, or any other content. */
  children: ReactNode;
  /** Overrides the dropdown-tier z-index token. */
  zIndex?: number | string;
  /** By default the panel is as wide as its content, at least 200px (240px from
   * 640px up). */
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  /** Distance from the trigger. Replaces the default entirely: a submenu's
   * default lines its first item up with its trigger. (Blade reads this from
   * the overlay's props, so wrapping MenuOverlay loses it; here it travels
   * through context.) */
  offset?: OffsetOptions;
}

/** The floating panel. It is portalled, and only rendered while the menu is
 * open. Scrolls when taller than the space available. */
export function MenuOverlay({ children, zIndex, width, minWidth, maxWidth, offset }: MenuOverlayProps) {
  const menu = useMenuContext("MenuOverlay");

  useLayoutEffect(() => {
    menu.overlayOffsetRef.current = offset;
    return () => {
      menu.overlayOffsetRef.current = undefined;
    };
  }, [menu.overlayOffsetRef, offset]);

  if (!menu.isMounted) return null;

  return (
    <FloatingPortal>
      {/* Non-modal: focus is not trapped and the page stays interactive, so a
          menu can sit inside anything. Nothing is focused on a mouse open;
          list navigation moves focus in when opened from the keyboard. Only
          the root menu returns focus on close — a submenu hands it back to
          its parent's item (see Menu). */}
      <FloatingFocusManager context={menu.floatingContext} modal={false} initialFocus={-1} returnFocus={!menu.isNested}>
        <div
          ref={menu.refs.setFloating}
          className="ds-menu__overlay"
          style={{
            ...menu.floatingStyles,
            ...menu.transitionStyles,
            ...(zIndex !== undefined ? { zIndex } : {}),
            ...(width ? { width } : {}),
            ...(minWidth ? { minWidth } : {}),
            ...(maxWidth ? { maxWidth } : {}),
          }}
          {...menu.getFloatingProps({ onKeyDown: menu.handleEscape })}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
