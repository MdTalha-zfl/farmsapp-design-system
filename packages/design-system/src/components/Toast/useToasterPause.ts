import { useCallback, useEffect, useRef, type FocusEvent, type PointerEvent, type RefObject } from "react";
import { toastStore } from "./toastStore";

type Source = "pointer" | "focus" | "hidden";

/**
 * Pauses every toast countdown while someone is interacting with the toasts
 * (mouse over them, keyboard focus inside them) or can't see them (tab
 * hidden). Each source holds its own release function from
 * `toastStore.pause()`, so they overlap safely: countdowns resume only when
 * the last source lets go.
 *
 * Two traps this guards against, both of which would leave toasts that
 * never auto-dismiss again:
 * - Touch: a tap fires mouse-style enter events with no matching leave, so
 *   only `pointerType === "mouse"` counts as hover.
 * - Removed nodes: a toast removed under the pointer or focus may never
 *   fire leave/blur, so `reconcile` drops pointer/focus holds once the
 *   thing they refer to is gone.
 */
export function useToasterPause(rootRef: RefObject<HTMLElement>, toastCount: number) {
  const releases = useRef<Partial<Record<Source, () => void>>>({});

  const hold = useCallback((source: Source) => {
    if (!releases.current[source]) releases.current[source] = toastStore.pause();
  }, []);

  const drop = useCallback((source: Source) => {
    releases.current[source]?.();
    delete releases.current[source];
  }, []);

  // Hidden tab: the countdown must not run out while nobody can see the toast.
  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === "hidden") hold("hidden");
      else drop("hidden");
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      // Unmounting mid-pause would otherwise leave the store paused forever.
      (Object.keys(releases.current) as Source[]).forEach(drop);
    };
  }, [hold, drop]);

  // Reconcile after every change in what's on screen.
  useEffect(() => {
    if (toastCount === 0) drop("pointer");
    const root = rootRef.current;
    if (!root || !root.contains(document.activeElement)) drop("focus");
  }, [toastCount, rootRef, drop]);

  return {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") hold("pointer");
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") drop("pointer");
    },
    onFocus: () => hold("focus"),
    onBlur: (event: FocusEvent<HTMLElement>) => {
      // Focus moving between elements inside the toasts is still "within".
      if (!event.currentTarget.contains(event.relatedTarget)) drop("focus");
    },
  };
}
