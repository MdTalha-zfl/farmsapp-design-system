import { Children, isValidElement, useRef, type KeyboardEvent, type ReactNode } from "react";
import {
  useFloating,
  useTransitionStyles,
  useTransitionStatus,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
} from "@floating-ui/react";
import { XIcon } from "@farmsapp/icons";
import { IconButton } from "../IconButton/IconButton";
import { ModalContextProvider, type ModalContextValue } from "./ModalContext";
import { ModalHeader } from "./ModalHeader";

export type ModalSize = "small" | "medium" | "large" | "full";

export interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onDismiss?: () => void;
  /** Defaults to true. Gates backdrop click, Escape, and close-button
   * rendering all at once — matches Blade's real single-flag API. */
  isDismissible?: boolean;
  /** Falls back to the header's close button. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Defaults to "small". */
  size?: ModalSize;
  accessibilityLabel?: string;
}

const MAX_WIDTH: Record<ModalSize, string> = {
  small: "400px",
  medium: "760px",
  large: "1024px",
  full: "100%",
};

const MAX_HEIGHT: Record<ModalSize, string> = {
  small: "80vh",
  medium: "80vh",
  large: "80vh",
  full: "100vh",
};

export function Modal({
  children,
  isOpen,
  onDismiss,
  isDismissible = true,
  initialFocusRef,
  size = "small",
  accessibilityLabel,
}: ModalProps) {
  // No placement middleware — Modal centers via CSS, not floating-ui
  // coordinates. Still calling useFloating() for its `context`, which feeds
  // useTransitionStyles/FloatingFocusManager/FloatingPortal for free and
  // keeps Modal mechanically identical to Popover/Tooltip rather than a
  // third animation pattern. See decisions/decision-modal-api-and-structure.md.
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) onDismiss?.();
    },
    middleware: [],
  });

  const defaultInitialFocusRef = useRef<HTMLButtonElement>(null);

  // `initial` deliberately has no `transform` key — see the exact bug this
  // sidesteps in decisions/decision-modal-api-and-structure.md (Popover's
  // transform collision): the overlay's own `styles` object only ever
  // carries `opacity`. The panel's scale-in is driven separately below, by
  // `status` from `useTransitionStatus` — a plain inline style toggled
  // between two fixed values, with the actual interpolation left to a real
  // CSS `transition` on `.ds-modal__panel` (modal.css), not computed here.
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 150,
    initial: { opacity: 0 },
  });

  // Same `context`, same `duration` — stays in lockstep with the hook
  // above; `status` is what it doesn't expose on its own ('unmounted' |
  // 'initial' | 'open' | 'close').
  const { status } = useTransitionStatus(context, { duration: 150 });
  const isPanelVisible = status === "open";

  const close = () => onDismiss?.();

  // Blade renders an external floating close button when no ModalHeader is
  // present (its own header owns the in-flow close button otherwise) — its
  // real Modal.web.tsx doesn't runtime-detect this via componentIds either
  // per the extraction trace, but the behavior is real (see its Template
  // 2/3/4 anatomy), so detecting it here by child type is the mechanism,
  // not a guess. Compared by reference against the real ModalHeader export,
  // not a string/displayName check.
  const hasHeader = Children.toArray(children).some((child) => isValidElement(child) && child.type === ModalHeader);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isDismissible && event.key === "Escape") close();
  };

  const contextValue: ModalContextValue = { close, isDismissible, defaultInitialFocusRef };

  if (!isMounted) return null;

  return (
    <FloatingPortal>
      <ModalContextProvider value={contextValue}>
        <FloatingFocusManager
          context={context}
          modal
          guards
          returnFocus
          initialFocus={initialFocusRef ?? defaultInitialFocusRef}
        >
          <FloatingOverlay
            ref={refs.setFloating}
            lockScroll
            className="ds-modal-overlay"
            style={transitionStyles}
            onClick={() => {
              if (isDismissible) close();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={accessibilityLabel}
              className={`ds-modal__panel ds-modal__panel--size-${size}`}
              style={{
                maxWidth: MAX_WIDTH[size],
                maxHeight: MAX_HEIGHT[size],
                opacity: isPanelVisible ? 1 : 0,
                transform: isPanelVisible ? "scale(1)" : "scale(0.96)",
              }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              {!hasHeader && isDismissible ? (
                <IconButton
                  ref={defaultInitialFocusRef}
                  icon={XIcon}
                  size="small"
                  emphasis="subtle"
                  accessibilityLabel="Close"
                  onClick={close}
                  className="ds-modal__close-floating"
                />
              ) : null}
              {children}
            </div>
          </FloatingOverlay>
        </FloatingFocusManager>
      </ModalContextProvider>
    </FloatingPortal>
  );
}
