import { cloneElement, useRef, type ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  useHover,
  useFocus,
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
  type Placement,
} from "@floating-ui/react";
import { useControllableState, useId, useMergeRefs } from "@farmsapp/utilities";
import { Text } from "../Text/Text";

export type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

export interface TooltipProps {
  title?: string;
  content: string;
  /** Defaults to "top". */
  placement?: TooltipPlacement;
  children: ReactElement;
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  maxWidth?: string;
}

const GAP = 8;
const ARROW_WIDTH = 14;
const ARROW_HEIGHT = 8;

export function Tooltip({
  title,
  content,
  placement = "top",
  children,
  isOpen: controlledIsOpen,
  defaultIsOpen = false,
  onOpenChange,
  openDelay = 300,
  closeDelay = 100,
  maxWidth = "200px",
}: TooltipProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    ...(controlledIsOpen !== undefined ? { value: controlledIsOpen } : {}),
    defaultValue: defaultIsOpen,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });
  const tooltipId = useId();
  const arrowRef = useRef<SVGSVGElement>(null);

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

  const hover = useHover(context, { delay: { open: openDelay, close: closeDelay }, move: false });
  // No delay on focus, matching Blade's real, tested behavior — a keyboard
  // user can't "linger" the way a mouse can, so the tooltip shows instantly.
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([role, hover, focus, dismiss]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 100, 
    initial: { opacity: 0 },
  });

  // React 18 puts `ref` directly on the element; React 19 folds it into
  // `props.ref` instead — this project's peerDependencies span both
  // (^18 || ^19), so both are checked rather than assuming one.
  const childRef =
    (children as unknown as { ref?: unknown }).ref ?? (children.props as { ref?: unknown } | undefined)?.ref;
  const mergedRef = useMergeRefs(refs.setReference, childRef as never);

  const trigger = cloneElement(children, {
    ref: mergedRef,
    "aria-describedby": isMounted ? tooltipId : undefined,
    ...getReferenceProps(children.props as Record<string, unknown>),
  } as Record<string, unknown>);

  return (
    <>
      {trigger}
      {isMounted &&
        createPortal(
          <div
            ref={refs.setFloating}
            id={tooltipId}
            role="tooltip"
            style={{ ...floatingStyles, ...transitionStyles, zIndex: "var(--ds-z-index-tooltip)", maxWidth }}
            className="ds-tooltip"
            {...getFloatingProps()}
          >
            {title ? (
              <Text as="span" variant="body" size="small" weight="semibold" color="inverse" padding="0" className="ds-tooltip__title">
                {title}
              </Text>
            ) : null}
            <Text as="span" variant="body" size="small" color="inverse" padding="0">
              {content}
            </Text>
            <FloatingArrow
              ref={arrowRef}
              context={context}
              width={ARROW_WIDTH}
              height={ARROW_HEIGHT}
              fill="var(--ds-color-text-primary)"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
