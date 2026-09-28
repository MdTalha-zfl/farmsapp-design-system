import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  useFloating,
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
  FloatingPortal,
  type Placement,
} from "@floating-ui/react";
import { useId, useIsomorphicLayoutEffect } from "@farmsapp/utilities";
import { PopoverContent } from "../Popover/PopoverContent";
import type { PopoverPlacement } from "../Popover/Popover";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";
import { SpotlightPopoverTourMask, resolveSpotlightTarget, readTargetRadius } from "./SpotlightPopoverTourMask";

export interface SpotlightPopoverTourStepRenderProps {
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  /** Fires the SpotlightPopoverTour's `onFinish` callback. Does not itself close the tour —
   * closing is the consumer's call, made from inside `onFinish`, matching
   * Blade's real behavior exactly. */
  stopSpotlightPopoverTour: () => void;
  /** Zero-based. Reflects the step currently on screen, not `activeStep`
   * mid-transition — see decisions/decision-tour-api-and-structure.md. */
  activeStep: number;
  totalSteps: number;
}

export interface SpotlightPopoverTourStepConfig {
  /** Must match a `SpotlightPopoverTourStep`'s `name` in `children`. */
  name: string;
  /** Render function (not static JSX) — keeps navigation collocated per step. */
  content: (props: SpotlightPopoverTourStepRenderProps) => ReactElement;
  footer?: (props: SpotlightPopoverTourStepRenderProps) => ReactNode;
  title?: string;
  /** Rendered before the title, matches Popover's `titleLeading`. */
  titleLeading?: ReactNode;
  /** Defaults to "top". */
  placement?: PopoverPlacement;
}

export type SpotlightPopoverTourSteps = SpotlightPopoverTourStepConfig[];

export interface SpotlightPopoverTourProps {
  steps: SpotlightPopoverTourSteps;
  isOpen: boolean;
  /** Zero-based, controlled — SpotlightPopoverTour holds no step-index state of its own. */
  activeStep: number;
  onOpenChange?: (isOpen: boolean) => void;
  /** Fires when a step's `stopSpotlightPopoverTour()` is called. */
  onFinish?: () => void;
  /** Fires from `goToNext`/`goToPrevious`/`goToStep`. */
  onStepChange?: (step: number) => void;
  /** Page content containing `SpotlightPopoverTourStep` wrappers. */
  children: ReactNode;
}

export interface SpotlightPopoverTourContextValue {
  attachStep: (name: string, el: HTMLElement) => void;
  detachStep: (name: string) => void;
}

export const SpotlightPopoverTourContext = createContext<SpotlightPopoverTourContextValue | null>(null);

const GAP = 8;
const ARROW_WIDTH = 20;
const ARROW_HEIGHT = 10;
// Matches Popover's/Modal's own hardcoded transition duration (150ms,
// --ds-duration-base) — kept in sync by convention, not by reading the CSS
// var at runtime, same as those two components.
const TRANSITION_MS = 150;

/**
 * SpotlightPopoverTour — one context provider per tour, wrapping the page/section content
 * that contains its `SpotlightPopoverTourStep` targets. Only one SpotlightPopoverTour can be active over a
 * given subtree at a time (React Context only reaches the nearest
 * provider) — a real limitation of this architecture, not a bug. Wrap the
 * tour closer to the module that needs it if more than one is required on
 * the same page.
 */
export function SpotlightPopoverTour({ steps, isOpen, activeStep, onOpenChange, onFinish, onStepChange, children }: SpotlightPopoverTourProps) {
  const [targets, setTargets] = useState<Record<string, HTMLElement>>({});

  const attachStep = useCallback((name: string, el: HTMLElement) => {
    setTargets((prev) => (prev[name] === el ? prev : { ...prev, [name]: el }));
  }, []);
  const detachStep = useCallback((name: string) => {
    setTargets((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);
  const contextValue = useMemo<SpotlightPopoverTourContextValue>(() => ({ attachStep, detachStep }), [attachStep, detachStep]);

  const step = steps[activeStep] as SpotlightPopoverTourStepConfig | undefined;
  const rawTarget = step ? targets[step.name] : undefined;
  const target = rawTarget ? resolveSpotlightTarget(rawTarget) : null;

  if (process.env.NODE_ENV !== "production" && isOpen && step && !rawTarget) {
    console.warn(
      `@farmsapp/design-system: SpotlightPopoverTour's active step "${step.name}" has no matching <SpotlightPopoverTourStep name="${step.name}"> registered in its children yet.`,
    );
  }

  // The displayed step lags one transition behind `activeStep` so the old
  // target's spotlight/card can fade out before the new one fades in,
  // instead of an instant content swap.
  const [displayedStep, setDisplayedStep] = useState(activeStep);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const prevActiveStepRef = useRef(activeStep);

  useEffect(() => {
    if (activeStep === prevActiveStepRef.current) return;
    prevActiveStepRef.current = activeStep;
    setIsStepTransitioning(true);
    const timeout = setTimeout(() => {
      setDisplayedStep(activeStep);
      setIsStepTransitioning(false);
    }, TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [activeStep]);

  const displayedStepConfig = steps[displayedStep] as SpotlightPopoverTourStepConfig | undefined;
  const displayedRawTarget = displayedStepConfig ? targets[displayedStepConfig.name] : undefined;
  const displayedTarget = displayedRawTarget ? resolveSpotlightTarget(displayedRawTarget) : null;

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetRadius, setTargetRadius] = useState(12);

  // Recomputes on the target's own resize/scroll, not only on step change —
  // closes a real gap found in Blade's own SpotlightPopoverTour (its mask only recomputes
  // on step change). Matters concretely here: an Input entering its error
  // state can grow (helper text appearing below it), and the cutout must
  // track that, not just the field's pre-error geometry.
  //
  // Also listens to `window.visualViewport`, not just `window`, when it's
  // available — a mobile on-screen keyboard opening/closing is exactly this
  // kind of resize, and on several mobile browsers (notably iOS Safari) it
  // fires a `visualViewport` resize/scroll without firing one on `window`
  // at all, since the layout viewport doesn't shrink, only the visual one.
  useIsomorphicLayoutEffect(() => {
    if (!displayedTarget) {
      setTargetRect(null);
      return;
    }
    const measure = () => setTargetRect(displayedTarget.getBoundingClientRect());
    measure();
    setTargetRadius(readTargetRadius(displayedTarget));
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(displayedTarget);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [displayedTarget]);

  // Scrolls the *incoming* target into view as soon as it's known (not only
  // once its step is actually displayed), so the page has already settled
  // by the time the fade-in happens. Uses `visualViewport.height` over
  // `window.innerHeight` when available — with a keyboard open, the layout
  // viewport (and so `window.innerHeight`) can stay the page's full height
  // while the *visible* area shrinks to whatever the keyboard doesn't cover.
  useEffect(() => {
    if (!target) return;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const rect = target.getBoundingClientRect();
    const isTallerThanViewport = rect.height > viewportHeight;
    const isFullyInView = rect.top >= 0 && rect.bottom <= viewportHeight;
    const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const visibleRatio = rect.height > 0 ? visibleHeight / rect.height : 0;
    if (!isFullyInView && visibleRatio < 0.5) {
      target.scrollIntoView({ behavior: "smooth", block: isTallerThanViewport ? "start" : "center" });
    }
  }, [target]);

  const handleFloatingOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onOpenChange?.(false);
    },
    [onOpenChange],
  );

  const arrowRef = useRef<SVGSVGElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const { refs, floatingStyles, context } = useFloating({
    placement: (displayedStepConfig?.placement ?? "top") as Placement,
    open: isOpen && Boolean(displayedTarget),
    onOpenChange: handleFloatingOpenChange,
    middleware: [
      shift({ padding: GAP }),
      flip({ padding: GAP }),
      offset(GAP + ARROW_HEIGHT),
      arrowMiddleware({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useIsomorphicLayoutEffect(() => {
    refs.setReference(displayedTarget);
  }, [refs, displayedTarget]);

  // Non-modal, deliberately: the spotlighted target lives outside the
  // popover card's own DOM subtree (it's cloned in place on the page, the
  // card is portalled), so a modal trap would pull focus straight back into
  // the card the moment a user tried to click/type into the very field
  // SpotlightPopoverTour just spotlighted — exactly wrong for the address-validation use
  // case. `modal={false}` still sets initial focus and restores it on
  // close, it just doesn't loop Tab or block outside clicks. See
  // decisions/decision-tour-api-and-structure.md.
  const dismiss = useDismiss(context, { outsidePress: false, escapeKey: true });
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: TRANSITION_MS,
    initial: { opacity: 0 },
  });

  const stepOpacity = isStepTransitioning ? 0 : ((transitionStyles.opacity as number | undefined) ?? 1);

  const goToStep = useCallback((next: number) => onStepChange?.(next), [onStepChange]);
  const goToNext = useCallback(() => goToStep(activeStep + 1), [goToStep, activeStep]);
  const goToPrevious = useCallback(() => goToStep(activeStep - 1), [goToStep, activeStep]);
  const stopSpotlightPopoverTour = useCallback(() => onFinish?.(), [onFinish]);
  const handleClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);

  const renderProps: SpotlightPopoverTourStepRenderProps = {
    goToStep,
    goToNext,
    goToPrevious,
    stopSpotlightPopoverTour,
    activeStep: displayedStep,
    totalSteps: steps.length,
  };

  const liveAnnouncement = displayedStepConfig
    ? `Step ${displayedStep + 1} of ${steps.length}${displayedStepConfig.title ? `: ${displayedStepConfig.title}` : ""}`
    : "";

  return (
    <SpotlightPopoverTourContext.Provider value={contextValue}>
      {children}
      {isMounted && displayedStepConfig && (
        <FloatingPortal>
          <SpotlightPopoverTourMask rect={targetRect} radius={targetRadius} opacity={stepOpacity} />
          <FloatingFocusManager context={context} modal={false} initialFocus={closeButtonRef}>
            <div
              ref={refs.setFloating}
              role="dialog"
              aria-labelledby={displayedStepConfig.title ? titleId : undefined}
              style={{
                ...floatingStyles,
                opacity: stepOpacity,
                zIndex: "var(--ds-z-index-tour)",
                maxWidth: "328px",
              }}
              className="ds-spotlight-popover-tour__popover"
              {...getFloatingProps()}
            >
              <PopoverContent
                title={displayedStepConfig.title}
                titleLeading={displayedStepConfig.titleLeading}
                footer={displayedStepConfig.footer?.(renderProps)}
                content={displayedStepConfig.content(renderProps)}
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
              <VisuallyHidden>
                <span role="status" aria-live="polite">
                  {liveAnnouncement}
                </span>
              </VisuallyHidden>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </SpotlightPopoverTourContext.Provider>
  );
}
