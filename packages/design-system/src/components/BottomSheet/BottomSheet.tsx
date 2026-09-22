import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
import { DropdownOverlay } from "../Dropdown/DropdownOverlay";
import { useDropdownSheetGlue } from "../Dropdown/DropdownSheetGlue";
import { BottomSheetContextProvider, type BottomSheetContextValue } from "./BottomSheetContext";
import { BottomSheetHeader, isHeaderEmpty, type BottomSheetHeaderProps } from "./BottomSheetHeader";
import { useSheetDrag, type SheetLatest } from "./useSheetDrag";
import {
  computeStops,
  initialStopIndex,
  normalizeSnapPoints,
  stepStopIndex,
  type ReleaseResult,
} from "./snapPoints";

export interface BottomSheetProps {
  children: ReactNode;
  /** Required on its own. Inside a Dropdown (in place of a DropdownOverlay) it
   * can be left out: the sheet then opens and closes with the Dropdown. */
  isOpen?: boolean;
  onDismiss?: () => void;
  /** Defaults to true. Gates backdrop click, Escape, swipe-to-dismiss, and
   * close-button rendering all at once — same single flag as Modal. */
  isDismissible?: boolean;
  /** Ascending fractions (0–1) of viewport height. Defaults to
   * [0.35, 0.5, 0.85]. Bad input is cleaned up with a dev-mode warning. */
  snapPoints?: readonly number[];
  /** Falls back to the header's close button. */
  initialFocusRef?: RefObject<HTMLElement>;
  /** Used as the dialog's name when there's no BottomSheetHeader title. */
  accessibilityLabel?: string;
}

// Must match the `transition` duration on `.ds-bottom-sheet__panel`
// (--ds-duration-slow) — floating-ui keeps the sheet mounted this long after
// close so the exit animation can finish.
const TRANSITION_MS = 200;

// If a dismiss-swipe is ignored by a parent that keeps `isOpen` true, the
// sheet has already slid off-screen; this is how long we wait before
// bringing it back.
const DISMISS_IGNORED_RESTORE_MS = 400;

export function BottomSheet({
  children,
  isOpen: isOpenProp,
  onDismiss: onDismissProp,
  isDismissible = true,
  snapPoints,
  initialFocusRef,
  accessibilityLabel,
}: BottomSheetProps) {
  // Inside a Dropdown the sheet is its overlay: open state comes from there.
  // An AutoComplete's typing box lives on the page, which a modal sheet would
  // make inert, so for that one the sheet steps aside (see DropdownSheetGlue).
  const glue = useDropdownSheetGlue();
  const declinesSheet = glue?.isTypeable === true;
  const isOpen = !declinesSheet && (isOpenProp ?? glue?.isOpen ?? false);
  const onDismiss = onDismissProp ?? glue?.close;
  const registerSheet = glue?.registerSheet;
  useEffect(() => {
    if (!registerSheet || declinesSheet) return;
    return registerSheet();
  }, [registerSheet, declinesSheet]);
  useEffect(() => {
    if (declinesSheet && process.env.NODE_ENV !== "production") {
      console.warn(
        "@farmsapp/design-system: a BottomSheet inside a Dropdown with an AutoComplete is not supported yet " +
          "(the sheet is modal, so the typing box on the page cannot keep focus). Showing the normal overlay instead.",
      );
    }
  }, [declinesSheet]);

  // No placement middleware — the sheet is pinned to the bottom by CSS. Still
  // calling useFloating() for its `context`, same as Modal, which keeps every
  // overlay here on one mechanism.
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onDismiss?.();
    },
    middleware: [],
  });

  // Only `opacity` on the overlay's own style object — the panel's position is
  // a plain `transform` we own (see the layout effect below), so floating-ui's
  // transition styles can never collide with it (the bug Popover hit).
  const { isMounted, styles: overlayTransitionStyles } = useTransitionStyles(context, {
    duration: TRANSITION_MS,
    initial: { opacity: 0 },
  });
  const { status } = useTransitionStatus(context, { duration: TRANSITION_MS });
  const isSheetOpen = status === "open";

  const titleId = useId();
  const defaultInitialFocusRef = useRef<HTMLButtonElement>(null);

  // A callback ref that also mirrors the element into state. FloatingPortal
  // renders its children one commit *after* `isMounted` flips, so an effect
  // keyed on `isMounted` runs while the panel doesn't exist yet and never
  // re-runs (the sheet then had no stops and no drag). Keying effects on the
  // element itself makes them run exactly when it attaches.
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const setPanel = useCallback((element: HTMLDivElement | null) => {
    panelRef.current = element;
    setPanelEl(element);
  }, []);

  // --- snap points -------------------------------------------------------
  const snapKey = snapPoints?.join(",");
  const { points, issues } = useMemo(
    () => normalizeSnapPoints(snapKey === undefined ? undefined : snapKey.split(",").filter(Boolean).map(Number)),
    [snapKey],
  );
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && issues.length > 0) {
      console.warn(`@farmsapp/design-system: BottomSheet ${issues.join("; ")}.`);
    }
  }, [issues]);

  // --- measurement -------------------------------------------------------
  const [panelHeight, setPanelHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window === "undefined" ? 0 : window.innerHeight));
  const [stopIndex, setStopIndex] = useState(0);
  const initializedRef = useRef(false);

  const stops = useMemo(() => computeStops(panelHeight, viewportHeight, points), [panelHeight, viewportHeight, points]);

  // Everything the imperative paths (drag, restore timer) read, kept fresh.
  const latest = useRef<SheetLatest & { stopIndex: number; isOpen: boolean; onDismiss: (() => void) | undefined }>({
    stops: [],
    panelHeight: 0,
    isDismissible,
    stopIndex: 0,
    isOpen,
    onDismiss,
  });
  useLayoutEffect(() => {
    latest.current = { stops, panelHeight, isDismissible, stopIndex, isOpen, onDismiss };
  });

  useLayoutEffect(() => {
    const panel = panelEl;
    if (!panel) {
      initializedRef.current = false;
      return;
    }
    // Natural height (`height: auto`, capped by max-height) — offsetHeight
    // ignores the transform, so it is correct even while off-screen.
    const measure = () => {
      setPanelHeight((prev) => (Math.abs(panel.offsetHeight - prev) >= 1 ? panel.offsetHeight : prev));
      setViewportHeight(window.innerHeight);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(panel);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [panelEl]);

  // Pick the opening stop once per open, then just keep the index valid if the
  // stops change underneath it (content grew/shrank, viewport resized).
  useLayoutEffect(() => {
    if (!isMounted || stops.length === 0) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      setStopIndex(initialStopIndex(stops, points, viewportHeight));
    } else {
      setStopIndex((index) => Math.min(index, stops.length - 1));
    }
  }, [isMounted, stops, points, viewportHeight]);

  // --- position ----------------------------------------------------------
  const writeTransform = useCallback((visibleHeight: number | undefined) => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transform =
      visibleHeight === undefined ? "translateY(100%)" : `translateY(${latest.current.panelHeight - visibleHeight}px)`;
  }, []);

  // The panel's position is a `transform` written here (and by the drag hook),
  // never via a React style prop — React only diffs its own props, so a manual
  // write during a drag would otherwise be silently left in place.
  useLayoutEffect(() => {
    const visible = isSheetOpen ? stops[Math.min(stopIndex, stops.length - 1)] : undefined;
    writeTransform(visible);
  }, [isSheetOpen, stops, stopIndex, panelHeight, panelEl, writeTransform]);

  const handleRelease = useCallback(
    (result: ReleaseResult) => {
      if (result.kind === "snap") {
        setStopIndex(result.index);
        // The state may not change (snapped back to the same stop), so the
        // layout effect won't necessarily re-run — settle the DOM directly.
        writeTransform(latest.current.stops[result.index]);
        return;
      }
      writeTransform(undefined);
      latest.current.onDismiss?.();
      window.setTimeout(() => {
        if (latest.current.isOpen) writeTransform(latest.current.stops[latest.current.stopIndex]);
      }, DISMISS_IGNORED_RESTORE_MS);
    },
    [writeTransform],
  );

  const dragZoneProps = useSheetDrag({ panelRef, latest, onRelease: handleRelease });

  // --- header awareness --------------------------------------------------
  const headerProps = Children.toArray(children).reduce<BottomSheetHeaderProps | undefined>((found, child) => {
    if (found) return found;
    return isValidElement(child) && child.type === BottomSheetHeader
      ? (child as ReactElement<BottomSheetHeaderProps>).props
      : undefined;
  }, undefined);
  const hasHeaderContent = headerProps !== undefined && !isHeaderEmpty(headerProps);
  const headerTitle = headerProps?.title;

  // --- interaction -------------------------------------------------------
  const close = () => onDismiss?.();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isDismissible && event.key === "Escape") close();
  };

  // WAI-ARIA window-splitter pattern: the grabber is a focusable separator,
  // Up/Down step between snap stops, Home/End jump to the ends.
  const handleGrabberKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (stops.length < 2) return;
    let next: number | undefined;
    if (event.key === "ArrowUp") next = stepStopIndex(stopIndex, "up", stops.length);
    else if (event.key === "ArrowDown") next = stepStopIndex(stopIndex, "down", stops.length);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stops.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setStopIndex(next);
  };

  const contextValue: BottomSheetContextValue = {
    close,
    isDismissible,
    defaultInitialFocusRef,
    titleId,
    dragZoneProps,
  };

  if (declinesSheet) {
    return (
      <BottomSheetContextProvider value={contextValue}>
        <DropdownOverlay>{children}</DropdownOverlay>
      </BottomSheetContextProvider>
    );
  }

  // In a Dropdown the options must exist even while the sheet is closed — a
  // select shows the chosen option's title before it is ever opened — so the
  // content stays mounted, hidden, until the sheet takes it over.
  if (!isMounted) {
    return glue ? (
      <div style={{ display: "none" }}>
        <BottomSheetContextProvider value={contextValue}>{children}</BottomSheetContextProvider>
      </div>
    ) : null;
  }

  const isAdjustable = stops.length > 1;
  const topSnap = points[points.length - 1] ?? 0.85;

  return (
    <FloatingPortal>
      <BottomSheetContextProvider value={contextValue}>
        <FloatingFocusManager
          context={context}
          modal
          guards
          returnFocus
          // Inside a Dropdown: the chosen option (else the first), not Close.
          initialFocus={initialFocusRef ?? glue?.initialFocusRef ?? defaultInitialFocusRef}
        >
          <FloatingOverlay
            ref={refs.setFloating}
            lockScroll
            className="ds-bottom-sheet-overlay"
            // The off-screen panel (translateY(100%)) would otherwise extend
            // the overlay's scrollable area. `clip`, not `hidden`: a hidden
            // box can still be scrolled programmatically, and focusing the
            // close button inside the off-screen panel did exactly that,
            // dragging the whole sheet into view. `clip` can't be scrolled.
            style={{ ...overlayTransitionStyles, overflow: "clip" }}
            onClick={() => {
              if (isDismissible) close();
            }}
          >
            <div
              ref={setPanel}
              role="dialog"
              aria-modal="true"
              // Focusable (but not tabbable) so a click on plain content inside
              // lands focus on the panel; otherwise it fell to <body>, outside
              // the panel, and Escape (handled on the panel) did nothing.
              tabIndex={-1}
              aria-labelledby={headerTitle ? titleId : undefined}
              aria-label={headerTitle ? undefined : accessibilityLabel}
              className="ds-bottom-sheet__panel"
              style={{ maxHeight: `${topSnap * 100}%` }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label="Resize sheet"
                tabIndex={isAdjustable ? 0 : undefined}
                aria-valuemin={isAdjustable ? 0 : undefined}
                aria-valuemax={isAdjustable ? stops.length - 1 : undefined}
                aria-valuenow={isAdjustable ? Math.min(stopIndex, stops.length - 1) : undefined}
                aria-valuetext={isAdjustable ? `Size ${Math.min(stopIndex, stops.length - 1) + 1} of ${stops.length}` : undefined}
                className="ds-bottom-sheet__grabber"
                onKeyDown={handleGrabberKeyDown}
                {...dragZoneProps}
              />
              {isDismissible && !hasHeaderContent ? (
                <IconButton
                  ref={defaultInitialFocusRef}
                  icon={XIcon}
                  size="small"
                  emphasis="subtle"
                  accessibilityLabel="Close"
                  onClick={close}
                  className="ds-bottom-sheet__close-floating"
                />
              ) : null}
              {children}
            </div>
          </FloatingOverlay>
        </FloatingFocusManager>
      </BottomSheetContextProvider>
    </FloatingPortal>
  );
}
