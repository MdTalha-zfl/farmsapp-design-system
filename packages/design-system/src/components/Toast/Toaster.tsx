import { useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { toastStore } from "./toastStore";
import { ToastItem } from "./ToastItem";
import { useToasterPause } from "./useToasterPause";

export type ToasterPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

export interface ToasterProps {
  /** Omitted = bottom-center on phones, bottom-start from 600px up (pure CSS,
   * no JS breakpoint). An explicit value applies at every width. */
  placement?: ToasterPlacement;
  /** Accessible name of each toast's close button. Defaults to English;
   * pass a translated string for other locales. */
  dismissLabel?: string;
}

/**
 * Renders the toast queue. Mount once near the app root, outside any
 * component that unmounts on navigation, so toasts survive route changes.
 *
 * Offset from the screen edge is the `--ds-toast-offset` CSS variable (set it
 * on :root to clear a BottomNav/BottomBar); there is no z-index prop, it
 * uses the `zIndex.toast` token like Modal/BottomSheet use theirs.
 *
 * The two live regions are always mounted, even when empty: screen readers
 * announce content added to an existing region far more reliably than a
 * region that appears already populated. Danger toasts go in the assertive
 * `alert` region, everything else in the polite `status` one.
 * See decisions/decision-toast-api-and-structure.md.
 */
export function Toaster({ placement, dismissLabel = "Dismiss" }: ToasterProps) {
  const { toasts } = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );

  const rootRef = useRef<HTMLDivElement>(null);

  // Queued toasts have no slot yet, so they render nowhere (and announce
  // nothing) until the store promotes them.
  const shown = toasts.filter((entry) => entry.state !== "queued");
  const isDanger = (intent: string | undefined) => intent === "danger";

  const pauseHandlers = useToasterPause(rootRef, shown.length);

  // Escape closes the toast that holds focus, and only then. A global
  // Escape would fight Modal/Popover, which own the key while they're open.
  // stopPropagation keeps the same keypress from also reaching them.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    const id = (event.target as HTMLElement).closest<HTMLElement>("[data-toast-id]")?.dataset.toastId;
    const entry = shown.find((candidate) => candidate.id === id);
    if (entry && entry.state === "open" && entry.dismissible !== false) {
      event.stopPropagation();
      toastStore.dismiss(entry.id, "user");
    }
  };

  return (
    <FloatingPortal>
      <div
        ref={rootRef}
        className="ds-toaster"
        data-placement={placement}
        onKeyDown={handleKeyDown}
        {...pauseHandlers}
      >
        <div className="ds-toast-region" role="status" aria-live="polite" aria-atomic="false">
          {shown
            .filter((entry) => !isDanger(entry.intent))
            .map((entry) => (
              <ToastItem key={entry.id} entry={entry} dismissLabel={dismissLabel} />
            ))}
        </div>
        <div className="ds-toast-region" role="alert" aria-live="assertive" aria-atomic="false">
          {shown
            .filter((entry) => isDanger(entry.intent))
            .map((entry) => (
              <ToastItem key={entry.id} entry={entry} dismissLabel={dismissLabel} />
            ))}
        </div>
      </div>
    </FloatingPortal>
  );
}
