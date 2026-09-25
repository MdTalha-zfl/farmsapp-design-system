import { createContext, useContext, type CSSProperties, type KeyboardEvent, type MutableRefObject } from "react";
import type { ExtendedRefs, FloatingContext, OffsetOptions, ReferenceType, useInteractions } from "@floating-ui/react";

type Interactions = ReturnType<typeof useInteractions>;

/**
 * One menu's wiring, shared with its overlay and with the items inside it. A
 * nested menu's trigger is an item of its *parent*, and is rendered outside
 * the nested menu's own provider, so it reads the parent's value here.
 */
export interface MenuContextValue {
  isOpen: boolean;
  /** From the start of the open transition to the end of the close one. The
   * overlay is only rendered while mounted. */
  isMounted: boolean;
  isNested: boolean;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  getItemProps: Interactions["getItemProps"];
  getFloatingProps: Interactions["getFloatingProps"];
  refs: ExtendedRefs<ReferenceType>;
  floatingContext: FloatingContext;
  floatingStyles: CSSProperties;
  transitionStyles: CSSProperties;
  /** Closes on Escape and keeps that key from also reaching an enclosing
   * Modal/Drawer/BottomSheet, or this menu's parent menu. */
  handleEscape: (event: KeyboardEvent) => void;
  /** MenuOverlay writes its `offset` here; the menu, which owns positioning,
   * reads it. (A ref, so a new object each render costs nothing.) */
  overlayOffsetRef: MutableRefObject<OffsetOptions | undefined>;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

/** True only inside a menu's own trigger element, so a MenuItem used as a
 * submenu trigger knows to act as one (no private props leaking onto the DOM
 * the way a cloned `_isMenuTrigger` prop would). */
export const MenuTriggerContext = createContext(false);

// Only the callable parts are meaningful; the inert components that receive
// this stub never touch refs or context.
const FALLBACK = {
  isOpen: false,
  isMounted: false,
  isNested: false,
  activeIndex: null,
  setActiveIndex: () => {},
  getItemProps: (props?: object) => ({ ...props }),
  getFloatingProps: (props?: object) => ({ ...props }),
  refs: { setFloating: () => {} },
  floatingContext: {},
  floatingStyles: {},
  transitionStyles: {},
  handleEscape: () => {},
  overlayOffsetRef: { current: undefined },
} as unknown as MenuContextValue;

/** Dev-mode warn-and-degrade (not throw) on misuse, matching DropdownContext. */
export function useMenuContext(partName: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `@farmsapp/design-system: ${partName} must be rendered inside a Menu's MenuOverlay. Falling back to an inert stub — nothing will open or navigate.`,
      );
    }
    return FALLBACK;
  }
  return context;
}
