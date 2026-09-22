import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useListNavigation,
  useTypeahead,
  useInteractions,
  useTransitionStyles,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
} from "@floating-ui/react";
import { useControllableState } from "@farmsapp/utilities";
import { DropdownSheetGlueContext, type DropdownSheetGlue } from "./DropdownSheetGlue";
import {
  DropdownContextProvider,
  type DropdownContextValue,
  type DropdownKind,
  type OverlayConfig,
  type TriggerRegistration,
} from "./DropdownContext";

export interface DropdownProps {
  /** One trigger (DropdownButton, DropdownIconButton, SelectInput) and one
   * DropdownOverlay. */
  children: ReactNode;
  /** Controlled open state. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const DEFAULT_OVERLAY_CONFIG: OverlayConfig = { placement: "bottom-start" };

const GAP = 8;
const MAX_LIST_HEIGHT = 300;
const TRANSITION_MS = 100; // --ds-duration-fast

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/**
 * Owns the open state and every floating-ui interaction, and shares them with
 * the trigger, the overlay and the items through context. Items register
 * themselves (FloatingList/useListItem) rather than Dropdown scanning its
 * children, and selection is by value — see
 * decisions/decision-dropdown-scope-and-architecture.md.
 *
 * The same root serves two kinds of trigger. A button opens a *menu*: real
 * focus moves into the list (roving focus). A SelectInput registers itself as
 * a *select*: DOM focus stays on the field and the list is tracked with
 * `aria-activedescendant` (virtual focus), which is what a combobox needs.
 */
export function Dropdown({ children, isOpen: controlledIsOpen, onOpenChange }: DropdownProps) {
  const [isOpen, setIsOpenState] = useControllableState<boolean>({
    ...(controlledIsOpen !== undefined ? { value: controlledIsOpen } : {}),
    defaultValue: false,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });
  const setIsOpen = useCallback((open: boolean) => setIsOpenState(open), [setIsOpenState]);

  const [overlayConfig, setOverlayConfigState] = useState<OverlayConfig>(DEFAULT_OVERLAY_CONFIG);
  const setOverlayConfig = useCallback((config: OverlayConfig) => {
    setOverlayConfigState((previous) => (previous.placement === config.placement ? previous : config));
  }, []);

  // A BottomSheet inside this Dropdown (in place of a DropdownOverlay) makes it
  // a sheet dropdown. An AutoComplete can't be one (see DropdownSheetGlue).
  const [sheetCount, setSheetCount] = useState(0);
  const registerSheet = useCallback(() => {
    setSheetCount((count) => count + 1);
    return () => setSheetCount((count) => count - 1);
  }, []);
  const sheetInitialFocusRef = useRef<HTMLElement | null>(null);

  const [trigger, setTrigger] = useState<TriggerRegistration | null>(null);
  const registerTrigger = useCallback((next: TriggerRegistration | null) => setTrigger(next), []);
  const kind: DropdownKind = trigger ? "select" : "menu";
  const isSelect = kind === "select";
  const isTypeable = trigger?.isTypeable === true;
  const isSheet = sheetCount > 0 && !isTypeable;
  const keepTitlesRef = useRef(false);
  keepTitlesRef.current = sheetCount > 0;
  const isSelectRef = useRef(isSelect);
  isSelectRef.current = isSelect;

  const optionTitlesRef = useRef(new Map<string, string>());
  const [titlesVersion, bumpTitles] = useReducer((count: number) => count + 1, 0);
  const registerOption = useCallback((value: string, title: string) => {
    optionTitlesRef.current.set(value, title);
    bumpTitles();
    return () => {
      // A sheet's items unmount when it closes; forgetting their titles would
      // blank the field. (A closed sheet keeps a hidden copy mounted, but the
      // hand-over between the two leaves a gap of one commit.)
      if (!keepTitlesRef.current && optionTitlesRef.current.get(value) === title) optionTitlesRef.current.delete(value);
      bumpTitles();
    };
  }, []);
  // Identity changes whenever a title is added or removed, so consumers of the
  // context re-render and read the new title.
  const getOptionTitle = useCallback(
    (value: string) => (titlesVersion >= 0 ? optionTitlesRef.current.get(value) : undefined),
    [titlesVersion],
  );

  const listRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { refs, floatingStyles, context, update } = useFloating({
    open: isOpen,
    onOpenChange: (open) => setIsOpen(open),
    placement: overlayConfig.placement,
    strategy: "fixed",
    middleware: [
      offset(GAP),
      flip({ padding: GAP }),
      // Blade has `flip` but no `shift`, so a wide menu near a screen edge
      // could overflow horizontally.
      shift({ padding: GAP }),
      size({
        padding: GAP,
        apply({ availableHeight, rects, elements }) {
          // Cap at the list's own max, but never taller than the space that is
          // actually available (Blade uses a fixed 300px regardless).
          elements.floating.style.maxHeight = `${Math.max(0, Math.min(MAX_LIST_HEIGHT, availableHeight))}px`;
          // A select's panel is exactly as wide as its field.
          if (isSelectRef.current) {
            const width = `${rects.reference.width}px`;
            Object.assign(elements.floating.style, { width, minWidth: width, maxWidth: "none" });
          }
        },
      }),
    ],
  });

  // Which item is selected, by position in the list, so opening a select can
  // start on it and scroll it into view. Items are matched by their
  // `data-value` (selection is by value, never by index).
  const selectedValues = trigger?.values;
  const foundIndex =
    isSelect && selectedValues !== undefined && selectedValues.length > 0
      ? listRef.current.findIndex((element) => {
          const value = element?.getAttribute("data-value");
          return value != null && selectedValues.includes(value);
        })
      : -1;
  const selectedIndex = foundIndex >= 0 ? foundIndex : null;

  const click = useClick(context, {
    // A select handles Enter/Space itself (below): when the list is open they
    // choose the active item instead of toggling.
    keyboardHandlers: !isSelect,
    // Clicking a text field to place the caret must not close the list.
    toggle: !isTypeable,
  });
  // The sheet handles its own backdrop, Escape and swipe dismissal.
  const dismiss = useDismiss(context, { enabled: !isSheet });
  const role = useRole(context, { role: isTypeable ? "combobox" : isSelect ? "select" : "menu" });
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    // Menus wrap (the APG menu pattern); a select stops at the ends.
    loop: !isSelect,
    // A modal sheet moves DOM focus into itself, so there is no trigger focus
    // for `aria-activedescendant` to ride on: items take real (roving) focus.
    virtual: isSelect && !isSheet,
    selectedIndex,
  });
  const typeahead = useTypeahead(context, {
    // Typing in a text field is text, not a jump to an option.
    enabled: !isTypeable,
    listRef: labelsRef,
    activeIndex,
    onMatch: isOpen ? setActiveIndex : undefined,
    selectedIndex,
  });

  // Closes on Escape and keeps that key from also reaching an enclosing
  // Modal/Drawer/BottomSheet (the dropdown is a React descendant of those, so
  // their own `onKeyDown` would close them too). It runs on the trigger as
  // well as the panel: a select's DOM focus never leaves the trigger.
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen) return;
      event.stopPropagation();
      setIsOpen(false);
    },
    [isOpen, setIsOpen],
  );

  const suppressSpaceClickRef = useRef(false);
  const keyboardGuards = useMemo(
    () => ({
      reference: {
        onKeyDown(event: KeyboardEvent) {
          handleEscape(event);
          if (!isSelect || !isOpen || activeIndex == null || (event.key !== "Enter" && event.key !== " ")) return;
          // In a text field Space is a character, and Enter with nothing
          // highlighted is left alone (it may submit a form).
          if (isTypeable && event.key === " ") return;
          const item = listRef.current[activeIndex];
          const value = item?.getAttribute("data-value");
          if (value == null || item?.getAttribute("aria-disabled") === "true") return;
          // The field is a <button>: without this, Enter/Space would also
          // click it and toggle the list shut a moment after choosing.
          event.preventDefault();
          suppressSpaceClickRef.current = event.key === " ";
          trigger?.select(value);
          // A multiple select stays open so several options can be picked.
          if (!trigger?.isMultiple) setIsOpen(false);
        },
        onKeyUp(event: KeyboardEvent) {
          if (event.key === " " && suppressSpaceClickRef.current) {
            event.preventDefault();
            suppressSpaceClickRef.current = false;
          }
        },
      },
      floating: {
        onKeyDown(event: KeyboardEvent) {
          handleEscape(event);
          // In a sheet the options hold real focus, so Enter/Space arrive on
          // the option itself (a div, which does not click on its own).
          if (!isSheet || !isSelect || activeIndex == null || (event.key !== "Enter" && event.key !== " ")) return;
          const item = listRef.current[activeIndex];
          const value = item?.getAttribute("data-value");
          if (value == null || item?.getAttribute("aria-disabled") === "true") return;
          event.preventDefault();
          trigger?.select(value);
          if (!trigger?.isMultiple) setIsOpen(false);
        },
      },
    }),
    [handleEscape, isSelect, isSheet, isTypeable, isOpen, activeIndex, trigger, setIsOpen],
  );

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
    keyboardGuards,
  ]);

  const [duration] = useState(() => (prefersReducedMotion() ? 0 : TRANSITION_MS));
  // A small scale + settle, not just opacity. This `transform` is safe here
  // because DropdownOverlay applies it to an *inner* element, never to the
  // one `refs.setFloating` points at — that one carries floating-ui's own
  // positioning `transform`, and the two would overwrite each other on the
  // same element (the collision Popover hit).
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration,
    initial: { opacity: 0, transform: "scale(0.96) translateY(-4px)" },
  });

  // The list stays rendered while closed, so floating-ui's own
  // `whileElementsMounted` would keep listening to scroll/resize for every
  // closed dropdown on the page. Only track while it is actually showing.
  useEffect(() => {
    const reference = refs.reference.current;
    const floating = refs.floating.current;
    if (!isMounted || !reference || !floating) return;
    // `refs.reference` is the *position* reference (a select's whole field);
    // `refs.domReference` is the interactive element inside it.
    return autoUpdate(reference, floating, update);
  }, [isMounted, refs.reference, refs.floating, update]);

  useEffect(() => {
    if (!isOpen) setActiveIndex(null);
  }, [isOpen]);

  // In a sheet, real focus follows the active option. floating-ui does this
  // itself only when it has a floating element, and here the sheet owns that
  // element (the Dropdown has none), so it is done directly.
  useEffect(() => {
    if (!isSheet || !isOpen || activeIndex == null) return;
    const item = listRef.current[activeIndex];
    if (item && document.activeElement !== item) item.focus();
  }, [isSheet, isOpen, activeIndex]);

  const value = useMemo<DropdownContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      isMounted,
      floatingStyles,
      transitionStyles,
      refs,
      floatingContext: context,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      handleEscape,
      listRef,
      labelsRef,
      activeIndex,
      setOverlayConfig,
      kind,
      trigger,
      registerTrigger,
      registerOption,
      getOptionTitle,
      setActiveIndex,
      isSheet,
    }),
    [
      isOpen,
      setIsOpen,
      isMounted,
      floatingStyles,
      transitionStyles,
      refs,
      context,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      handleEscape,
      activeIndex,
      setOverlayConfig,
      kind,
      trigger,
      registerTrigger,
      registerOption,
      getOptionTitle,
      setActiveIndex,
      isSheet,
    ],
  );

  const glue = useMemo<DropdownSheetGlue>(
    () => ({
      isOpen,
      close: () => setIsOpen(false),
      isTypeable,
      registerSheet,
      initialFocusRef: sheetInitialFocusRef,
    }),
    [isOpen, setIsOpen, isTypeable, registerSheet],
  );

  return (
    <DropdownContextProvider value={value}>
      <DropdownSheetGlueContext.Provider value={glue}>{children}</DropdownSheetGlueContext.Provider>
    </DropdownContextProvider>
  );
}
