import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  autoUpdate,
  flip,
  FloatingList,
  FloatingNode,
  FloatingTree,
  offset as offsetMiddleware,
  safePolygon,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTransitionStyles,
  useTypeahead,
  type OffsetOptions,
  type Placement,
} from "@floating-ui/react";
import { useControllableState } from "@farmsapp/utilities";
import { MenuContext, MenuTriggerContext, type MenuContextValue } from "./MenuContext";
import { MenuOverlay } from "./MenuOverlay";

export interface MenuProps {
  /** The trigger — any element that forwards a ref and passes its props to a
   * DOM element (Button, IconButton, Avatar, a link…) — and a MenuOverlay.
   * For a submenu, the trigger is a MenuItem. */
  children: ReactNode;
  /** Controlled open state. */
  isOpen?: boolean;
  /** Blade's payload shape (an object), unlike Dropdown's plain boolean. */
  onOpenChange?: (args: { isOpen: boolean }) => void;
  /** "hover" opens the menu on pointer hover as well as click. */
  openInteraction?: "click" | "hover";
  /** Where the panel prefers to sit; it still flips and shifts to stay in
   * view. Root menus only: a submenu always opens to its right. */
  defaultPlacement?: Placement;
}

const GAP = 8;
// Offsets are measured from the trigger, which is an *item* inside its parent
// panel: 8px of padding and a 1px border in from the panel's edge. So a
// submenu's first item lines up with its trigger by pulling it up that much,
// and a 4px gap between the two panels is that inset plus 4.
const PANEL_INSET = 9;
const SUBMENU_ALIGNMENT = -PANEL_INSET;
const SUBMENU_GAP = PANEL_INSET + 4;
const TRANSITION_MS = 100; // --ds-duration-fast

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function MenuInner({ children, isOpen: isOpenProp, onOpenChange, openInteraction = "click", defaultPlacement }: MenuProps) {
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const isNested = parentId != null;

  // The trigger is the first element that is not a MenuOverlay, found by type
  // (Blade takes children by position, so a conditional child shifts it).
  const elements = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[];
  const trigger = elements.find((element) => element.type !== MenuOverlay);
  const overlays = elements.filter((element) => element.type === MenuOverlay);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!trigger) console.error("@farmsapp/design-system: Menu needs a trigger element as well as a MenuOverlay.");
    if (overlays.length === 0) console.error("@farmsapp/design-system: Menu needs a MenuOverlay as a direct child.");
  }, [trigger, overlays.length]);

  const [isOpen, setIsOpenState] = useControllableState<boolean>({
    ...(isOpenProp !== undefined ? { value: isOpenProp } : {}),
    defaultValue: false,
    onChange: (next) => onOpenChange?.({ isOpen: next }),
  });
  const setIsOpen = useCallback((next: boolean) => setIsOpenState(next), [setIsOpenState]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const overlayOffsetRef = useRef<OffsetOptions | undefined>(undefined);

  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isNested ? "right-start" : (defaultPlacement ?? "bottom-start"),
    strategy: "fixed",
    middleware: [
      offsetMiddleware((state) => {
        const custom = overlayOffsetRef.current;
        if (custom === undefined) return isNested ? { mainAxis: SUBMENU_GAP, alignmentAxis: SUBMENU_ALIGNMENT } : GAP;
        return typeof custom === "function" ? custom(state) : custom;
      }),
      flip({ padding: GAP }),
      shift({ padding: GAP }),
      size({
        padding: GAP,
        apply({ availableHeight, elements: { floating } }) {
          floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    // A submenu opens on hover (and stays open while the pointer travels to
    // it, via the safe polygon); a root menu only if asked to.
    enabled: isNested || openInteraction === "hover",
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(context, {
    // A submenu's trigger is opened by hover or the keyboard, never toggled by
    // a mouse click. (Blade opens on mouse *down*; that left focus on <body>
    // after a mouse open, so the arrow keys did nothing until a Tab. On click
    // the trigger keeps focus, as in Dropdown.)
    toggle: !isNested,
    ignoreMouse: isNested,
  });
  const role = useRole(context, { role: "menu" });
  const dismiss = useDismiss(context);
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: isOpen ? setActiveIndex : undefined,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    role,
    dismiss,
    listNavigation,
    typeahead,
  ]);

  // One press of Escape closes one level, and must not also reach an enclosing
  // Modal/Drawer/BottomSheet or this menu's parent (both are React ancestors,
  // so their own `onKeyDown` would otherwise close them too). A submenu hands
  // focus back to its trigger, which is an item of the parent.
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen) return;
      event.stopPropagation();
      setIsOpen(false);
      if (isNested) (refs.domReference.current as HTMLElement | null)?.focus();
    },
    [isOpen, isNested, setIsOpen, refs],
  );

  // The tree lets levels talk: choosing an item closes every open menu, and
  // opening one submenu closes its open siblings.
  useEffect(() => {
    if (!tree) return;
    const handleTreeClick = () => setIsOpen(false);
    const handleSubmenuOpen = (event: { nodeId: string; parentId: string | null }) => {
      if (event.nodeId !== nodeId && event.parentId === parentId) setIsOpen(false);
    };
    tree.events.on("click", handleTreeClick);
    tree.events.on("menuopen", handleSubmenuOpen);
    return () => {
      tree.events.off("click", handleTreeClick);
      tree.events.off("menuopen", handleSubmenuOpen);
    };
  }, [tree, nodeId, parentId, setIsOpen]);
  useEffect(() => {
    if (isOpen && tree) tree.events.emit("menuopen", { parentId, nodeId });
  }, [tree, isOpen, nodeId, parentId]);

  const [duration] = useState(() => (prefersReducedMotion() ? 0 : TRANSITION_MS));
  // Opacity only: the panel's `transform` belongs to floating-ui's positioning.
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration,
    initial: { opacity: 0 },
  });

  useEffect(() => {
    if (!isOpen) setActiveIndex(null);
  }, [isOpen]);

  const menuContext = useMemo<MenuContextValue>(
    () => ({
      isOpen,
      isMounted,
      isNested,
      activeIndex,
      setActiveIndex,
      getItemProps,
      getFloatingProps,
      refs,
      floatingContext: context,
      floatingStyles,
      transitionStyles,
      handleEscape,
      overlayOffsetRef,
    }),
    [
      isOpen,
      isMounted,
      isNested,
      activeIndex,
      getItemProps,
      getFloatingProps,
      refs,
      context,
      floatingStyles,
      transitionStyles,
      handleEscape,
    ],
  );

  // The trigger's own ref (React 18 keeps it on the element, 19 in props), kept
  // alongside floating-ui's. `useMergeRefs` here is floating-ui's, which is
  // memoized: a fresh callback ref each render would detach and reattach the
  // reference every commit.
  const triggerOwnRef = trigger
    ? ((trigger as unknown as { ref?: Ref<unknown> }).ref ?? (trigger.props as { ref?: Ref<unknown> }).ref)
    : undefined;
  const triggerRef = useMergeRefs([refs.setReference, triggerOwnRef as Ref<unknown>]);

  const triggerElement = trigger
    ? cloneElement(trigger, {
        // Passing the trigger's own props through getReferenceProps *merges*
        // its handlers with the interactions' (Blade spreads the interaction
        // props over them, which replaces the trigger's own onClick).
        ...getReferenceProps({
          ...trigger.props,
          onKeyDown(event: KeyboardEvent) {
            (trigger.props.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event);
            handleEscape(event);
          },
        }),
        ref: triggerRef,
      } as Record<string, unknown>)
    : null;

  return (
    <FloatingNode id={nodeId}>
      <MenuTriggerContext.Provider value={isNested}>{triggerElement}</MenuTriggerContext.Provider>
      <MenuContext.Provider value={menuContext}>
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {overlays}
        </FloatingList>
      </MenuContext.Provider>
    </FloatingNode>
  );
}

/**
 * A menu of actions opened from a trigger. It is for doing things, not for
 * choosing a value — use a Dropdown with a SelectInput for that. It has no
 * responsive behavior of its own: on a small screen, render a BottomSheet
 * instead (or use a Dropdown, which can become one).
 *
 * Nest a Menu inside a MenuOverlay, with a MenuItem as its trigger, for a
 * submenu. Only the outermost Menu creates the FloatingTree that links levels.
 */
export function Menu(props: MenuProps): ReactElement {
  const parentId = useFloatingParentNodeId();
  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuInner {...props} />
      </FloatingTree>
    );
  }
  return <MenuInner {...props} />;
}
