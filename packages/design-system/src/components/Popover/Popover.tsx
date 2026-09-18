import { cloneElement, useRef, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  offset,
  flip,
  shift,
  arrow as arrowMiddleware,
  autoUpdate,
  FloatingArrow,
  FloatingFocusManager,
  type Placement,
} from "@floating-ui/react";
import { useControllableState, useId, useMergeRefs } from "@farmsapp/utilities";
import { PopoverContent } from "./PopoverContent";

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

export interface PopoverProps {
  title?: string;
  titleLeading?: ReactNode;
  footer?: ReactNode;
  /** Popover body content, required. */
  content: ReactElement;
  /** Defaults to "top". */
  placement?: PopoverPlacement;
  /** The trigger element. Non-interactive triggers (icons, badges) need
   * PopoverInteractiveWrapper. */
  children: ReactElement;
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Defaults to "328px". */
  maxWidth?: string;
  /** Element to receive focus on open. Falls back to the close button. */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const GAP = 8;
const ARROW_WIDTH = 20;
const ARROW_HEIGHT = 10;

export function Popover({
  title,
  titleLeading,
  footer,
  content,
  placement = "top",
  children,
  isOpen: controlledIsOpen,
  defaultIsOpen = false,
  onOpenChange,
  maxWidth = "328px",
  initialFocusRef,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    ...(controlledIsOpen !== undefined ? { value: controlledIsOpen } : {}),
    defaultValue: defaultIsOpen,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });
  const titleId = useId();
  const arrowRef = useRef<SVGSVGElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    placement: placement as Placement,
    open: isOpen,
    onOpenChange: (open) => setIsOpen(open),
    middleware: [
      shift({ padding: GAP }),
      flip({ padding: GAP }),
      offset(GAP + ARROW_HEIGHT),
      arrowMiddleware({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { enabled: controlledIsOpen === undefined });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([role, click, dismiss]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 150,
    initial: { opacity: 0 },
  });

  // React 18 puts `ref` directly on the element; React 19 folds it into
  // `props.ref` instead — this project's peerDependencies span both
  // (^18 || ^19), matching Tooltip's own handling of the same issue.
  const childRef =
    (children as unknown as { ref?: unknown }).ref ?? (children.props as { ref?: unknown } | undefined)?.ref;
  const mergedRef = useMergeRefs(refs.setReference, childRef as never);

  const trigger = cloneElement(children, {
    ref: mergedRef,
    "aria-haspopup": "dialog",
    ...getReferenceProps(children.props as Record<string, unknown>),
  } as Record<string, unknown>);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {trigger}
      {isMounted &&
        createPortal(
          <FloatingFocusManager context={context} modal guards initialFocus={initialFocusRef ?? closeButtonRef}>
            <div
              ref={refs.setFloating}
              role="dialog"
              aria-labelledby={title ? titleId : undefined}
              style={{ ...floatingStyles, ...transitionStyles, zIndex: "var(--ds-z-index-popover)", maxWidth }}
              className="ds-popover"
              {...getFloatingProps()}
            >
              <PopoverContent
                title={title}
                titleLeading={titleLeading}
                footer={footer}
                content={content}
                titleId={titleId}
                onClose={handleClose}
                closeButtonRef={closeButtonRef}
              />
              <FloatingArrow
                ref={arrowRef}
                context={context}
                width={ARROW_WIDTH}
                height={ARROW_HEIGHT}
                fill="var(--ds-color-surface-raised)"
                stroke="var(--ds-color-border-default)"
                strokeWidth={1}
              />
            </div>
          </FloatingFocusManager>,
          document.body,
        )}
    </>
  );
}
