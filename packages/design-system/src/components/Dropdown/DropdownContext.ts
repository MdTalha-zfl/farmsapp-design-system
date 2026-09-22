import { createContext, useContext, type CSSProperties, type KeyboardEvent, type MutableRefObject } from "react";
import type { ExtendedRefs, FloatingContext, Placement, ReferenceType, useInteractions } from "@floating-ui/react";

type Interactions = ReturnType<typeof useInteractions>;

/** What DropdownOverlay tells the root about how its panel should be placed
 * and sized. The root owns `useFloating`, so it needs these to position. */
export interface OverlayConfig {
  placement: Placement;
}

/** "menu": a button opens a list of actions (roving focus, real focus moves
 * into the list). "select": a SelectInput picks a value (virtual focus — DOM
 * focus stays on the trigger, `aria-activedescendant` tracks the item). */
export type DropdownKind = "menu" | "select";

/** A SelectInput publishes its selection up to the Dropdown, so the items
 * (which live in the overlay, not under the trigger) can read and change it.
 * The state itself lives in the SelectInput. */
export interface TriggerRegistration {
  values: string[];
  /** Single: replace the selection. Multiple: toggle this value. */
  select: (value: string) => void;
  /** Multiple: the list stays open after a pick, options show a checkbox. */
  isMultiple: boolean;
  /** An AutoComplete: the trigger is a text input, so Space types a space,
   * Home/End move the caret, and typeahead is off. */
  isTypeable: boolean;
  /** AutoComplete only: the values to show. Items outside it stay registered
   * (so a chosen tag keeps its title) but render nothing. Undefined = all. */
  filteredValues?: string[] | undefined;
  /** Shown when `filteredValues` is empty. */
  emptyMessage?: string | undefined;
}

export interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  /** True from the start of the open transition until the end of the close
   * one. The list stays rendered while closed (hidden), so a select can show
   * the chosen item's title before it is ever opened. */
  isMounted: boolean;
  floatingStyles: CSSProperties;
  transitionStyles: CSSProperties;
  refs: ExtendedRefs<ReferenceType>;
  floatingContext: FloatingContext;
  getReferenceProps: Interactions["getReferenceProps"];
  getFloatingProps: Interactions["getFloatingProps"];
  getItemProps: Interactions["getItemProps"];
  /** Closes the dropdown on Escape and stops the key from also reaching an
   * enclosing Modal/Drawer/BottomSheet (the dropdown is a React descendant of
   * those, so their `onKeyDown` would otherwise close them as well). */
  handleEscape: (event: KeyboardEvent) => void;
  listRef: MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: MutableRefObject<Array<string | null>>;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  /** A BottomSheet is standing in for the overlay: the list is inside a modal
   * dialog, so focus moves into it (roving) instead of staying on the trigger. */
  isSheet: boolean;
  setOverlayConfig: (config: OverlayConfig) => void;
  kind: DropdownKind;
  trigger: TriggerRegistration | null;
  registerTrigger: (trigger: TriggerRegistration | null) => void;
  /** Items report their title by value, so a select can show the chosen
   * item's title before the list has ever been opened. Returns an unregister
   * function. */
  registerOption: (value: string, title: string) => () => void;
  getOptionTitle: (value: string) => string | undefined;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

// Only the callable parts are meaningful; refs/context are never touched by
// the inert components that receive this stub.
const FALLBACK = {
  isOpen: false,
  setIsOpen: () => {},
  isMounted: false,
  floatingStyles: {},
  transitionStyles: {},
  refs: { setReference: () => {}, setFloating: () => {} },
  floatingContext: {},
  getReferenceProps: (props?: object) => ({ ...props }),
  getFloatingProps: () => ({}),
  getItemProps: (props?: object) => ({ ...props }),
  handleEscape: () => {},
  listRef: { current: [] },
  labelsRef: { current: [] },
  activeIndex: null,
  setActiveIndex: () => {},
  isSheet: false,
  setOverlayConfig: () => {},
  kind: "menu",
  trigger: null,
  registerTrigger: () => {},
  registerOption: () => () => {},
  getOptionTitle: () => undefined,
} as unknown as DropdownContextValue;

/**
 * Dev-mode warn-and-degrade (not throw) on misuse, matching ModalContext,
 * DrawerContext and BottomSheetContext.
 */
export function useDropdownContext(): DropdownContextValue {
  const context = useContext(DropdownContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: Dropdown parts (DropdownButton, DropdownOverlay, ActionList, ActionListItem) " +
          "must be rendered inside a Dropdown. Falling back to inert stubs — nothing will open or navigate.",
      );
    }
    return FALLBACK;
  }
  return context;
}

export const DropdownContextProvider = DropdownContext.Provider;
