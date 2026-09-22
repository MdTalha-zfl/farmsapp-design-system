import { useMemo, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { applyRubberBand, resolveRelease, type ReleaseResult } from "./snapPoints";
import type { DragZoneProps } from "./BottomSheetContext";

/** Latest values the drag handlers need, kept in a ref so the handlers stay
 * referentially stable across renders. */
export interface SheetLatest {
  stops: number[];
  panelHeight: number;
  isDismissible: boolean;
}

interface UseSheetDragOptions {
  panelRef: RefObject<HTMLElement | null>;
  latest: MutableRefObject<SheetLatest>;
  onRelease: (result: ReleaseResult) => void;
}

interface DragState {
  pointerId: number;
  startY: number;
  startVisible: number;
  panelHeight: number;
  /** Displayed (rubber-banded) visible height. */
  visible: number;
  /** Raw, un-banded visible height at the last move, for velocity. */
  lastRaw: number;
  lastTime: number;
  /** px/ms, positive while the sheet is growing. */
  velocity: number;
}

// Drags never start from interactive controls inside a drag zone (the close
// button, a search input in the header, footer buttons) — those keep their
// own click/typing behavior.
const INTERACTIVE_SELECTOR = "button, a, input, textarea, select, [role='button'], [data-no-drag]";

// A pause this long before release means the pointer was resting, so any
// remembered velocity is stale and must not fling the sheet.
const STALE_VELOCITY_MS = 80;

/**
 * Pointer-Events drag for the sheet's grabber/header/footer. While dragging,
 * the panel's `transform` is written straight to the DOM and no React state
 * changes — React only hears about the result once, on release. Blade
 * re-renders its whole sheet (and every context consumer) on every frame.
 */
export function useSheetDrag({ panelRef, latest, onRelease }: UseSheetDragOptions): DragZoneProps {
  const stateRef = useRef<DragState | null>(null);
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  return useMemo<DragZoneProps>(() => {
    const finish = (event: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
      const state = stateRef.current;
      if (!state || event.pointerId !== state.pointerId) return;
      stateRef.current = null;
      panelRef.current?.removeAttribute("data-dragging");

      const stale = event.timeStamp - state.lastTime > STALE_VELOCITY_MS;
      const velocity = cancelled || stale ? 0 : state.velocity;
      const { stops, isDismissible } = latest.current;
      onReleaseRef.current(resolveRelease({ visibleHeight: state.visible, velocity, stops, isDismissible }));
    };

    return {
      onPointerDown: (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if ((event.target as Element).closest(INTERACTIVE_SELECTOR)) return;
        const panel = panelRef.current;
        const { stops, panelHeight } = latest.current;
        if (!panel || stops.length === 0) return;

        // Read where the panel visually is right now (it may be mid-transition),
        // not where React thinks it should be, so grabbing a moving sheet
        // doesn't jump.
        const translateY = new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42;
        const visible = panelHeight - translateY;

        event.currentTarget.setPointerCapture(event.pointerId);
        panel.setAttribute("data-dragging", "true");
        stateRef.current = {
          pointerId: event.pointerId,
          startY: event.clientY,
          startVisible: visible,
          panelHeight,
          visible,
          lastRaw: visible,
          lastTime: event.timeStamp,
          velocity: 0,
        };
      },

      onPointerMove: (event) => {
        const state = stateRef.current;
        const panel = panelRef.current;
        if (!state || !panel || event.pointerId !== state.pointerId) return;

        const raw = state.startVisible - (event.clientY - state.startY);
        const elapsed = event.timeStamp - state.lastTime;
        if (elapsed > 0) {
          const instant = (raw - state.lastRaw) / elapsed;
          state.velocity = 0.6 * instant + 0.4 * state.velocity;
          state.lastRaw = raw;
          state.lastTime = event.timeStamp;
        }

        const { stops, isDismissible } = latest.current;
        const min = isDismissible ? 0 : (stops[0] ?? 0);
        const max = stops[stops.length - 1] ?? 0;
        state.visible = applyRubberBand(raw, min, max);
        panel.style.transform = `translateY(${state.panelHeight - state.visible}px)`;
      },

      onPointerUp: (event) => finish(event, false),
      onPointerCancel: (event) => finish(event, true),
    };
  }, [panelRef, latest]);
}
