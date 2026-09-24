import {
  Children,
  isValidElement,
  useRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import {
  useFloating,
  useTransitionStyles,
  useTransitionStatus,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
} from "@floating-ui/react";
import { useId } from "@farmsapp/utilities";
import { XIcon } from "@farmsapp/icons";
import { IconButton } from "../IconButton/IconButton";
import { DrawerContextProvider, type DrawerContextValue } from "./DrawerContext";
import { DrawerHeader, type DrawerHeaderProps } from "./DrawerHeader";

export interface DrawerProps {
  children: ReactNode;
  isOpen: boolean;
  /** A request, not a command: `isOpen` is controlled, so the consumer can
   * veto any dismissal by not updating it. */
  onDismiss: () => void;
  /** Defaults to true. Gates overlay click, Escape, the close button and the
   * back button all at once — same single flag as Modal and BottomSheet. */
  isDismissible?: boolean;
  /** Defaults to true. `false` removes the backdrop, and with it the scroll
   * lock and click-outside dismissal. */
  showOverlay?: boolean;
  /** Defaults to true: nothing renders until the first open and everything
   * unmounts after the exit animation (children lose their state). `false`
   * renders the whole drawer from the start, hidden while closed, so children
   * keep their state and DOM. */
  isLazy?: boolean;
  /** Falls back to the header's close button. */
  initialFocusRef?: RefObject<HTMLElement>;
  /** Used as the dialog's name when there's no DrawerHeader title. */
  accessibilityLabel?: string;
}

// Must match the panel's `transition` duration in drawer.css
// (--ds-duration-slow): floating-ui keeps the drawer mounted this long after
// close so the exit animation can finish.
const TRANSITION_MS = 200;

export function Drawer({
  children,
  isOpen,
  onDismiss,
  isDismissible = true,
  showOverlay = true,
  isLazy = true,
  initialFocusRef,
  accessibilityLabel,
}: DrawerProps) {
  // No placement middleware — the drawer is pinned to the right edge by CSS.
  // Still calling useFloating() for its `context`, same as Modal/BottomSheet.
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onDismiss();
    },
    middleware: [],
  });

  // The overlay's style object only ever carries `opacity`; the panel's slide
  // is a plain `transform` we own, so floating-ui's transition styles can
  // never collide with it (the bug Popover hit).
  const { isMounted, styles: overlayTransitionStyles } = useTransitionStyles(context, {
    duration: TRANSITION_MS,
    initial: { opacity: 0 },
  });
  const { status } = useTransitionStatus(context, { duration: TRANSITION_MS });
  const isPanelOpen = status === "open";

  const titleId = useId();
  const defaultInitialFocusRef = useRef<HTMLButtonElement>(null);

  // Stacking (Chunk 2) will replace these two with values from the drawer
  // stack registry. See decisions/decision-drawer-api-and-structure.md.
  const level = 1;
  const peekOffset = 0;

  const headerElement = Children.toArray(children).find(
    (child): child is ReactElement<DrawerHeaderProps> => isValidElement(child) && child.type === DrawerHeader,
  );
  const hasHeader = headerElement !== undefined;
  const headerTitle = headerElement?.props.title;

  const close = () => onDismiss();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isDismissible && event.key === "Escape") close();
  };

  const contextValue: DrawerContextValue = {
    close,
    closeAll: close,
    isDismissible,
    defaultInitialFocusRef,
    titleId,
    level,
  };

  if (!isMounted && isLazy) return null;

  const showFloatingClose = isDismissible && !hasHeader;

  return (
    <FloatingPortal>
      <DrawerContextProvider value={contextValue}>
        {/* disabled while hidden (isLazy={false}): a closed drawer must not
            trap or steal focus. */}
        <FloatingFocusManager
          context={context}
          modal
          guards
          returnFocus
          disabled={!isMounted}
          initialFocus={initialFocusRef ?? defaultInitialFocusRef}
        >
          <FloatingOverlay
            ref={refs.setFloating}
            lockScroll={isMounted && showOverlay}
            className={showOverlay ? "ds-drawer-overlay" : "ds-drawer-overlay ds-drawer-overlay--no-backdrop"}
            // `clip`, not `hidden`: the off-screen panel would otherwise extend
            // the overlay's scrollable area, and focusing the close button
            // inside it scrolled the whole panel into view (the BottomSheet
            // bug). `display: none` while closed only applies to isLazy={false}.
            style={{ ...overlayTransitionStyles, overflow: "clip", ...(isMounted ? {} : { display: "none" }) }}
            onClick={() => {
              if (isDismissible && showOverlay) close();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              // Focusable (but not tabbable) so a click on plain content inside
              // lands focus on the panel. Without this it fell to <body>,
              // outside the panel, and Escape — handled on the panel — did
              // nothing.
              tabIndex={-1}
              aria-labelledby={headerTitle ? titleId : undefined}
              aria-label={headerTitle ? undefined : accessibilityLabel}
              className={showFloatingClose ? "ds-drawer__panel ds-drawer__panel--headerless" : "ds-drawer__panel"}
              style={isPanelOpen ? { transform: `translateX(${-peekOffset}px)` } : undefined}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              {showFloatingClose ? (
                <IconButton
                  ref={defaultInitialFocusRef}
                  icon={XIcon}
                  size="small"
                  emphasis="subtle"
                  accessibilityLabel="Close"
                  onClick={close}
                  className="ds-drawer__close-floating"
                />
              ) : null}
              {children}
            </div>
          </FloatingOverlay>
        </FloatingFocusManager>
      </DrawerContextProvider>
    </FloatingPortal>
  );
}
