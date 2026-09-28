import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactElement } from "react";
import type { Responsive } from "../Box/Box";
import {
  StepperContext,
  StepperItemPositionContext,
  type StepperColor,
  type StepperContextValue,
  type StepperIndicator,
  type StepperItemStatus,
  type StepperOrientation,
} from "./StepperContext";
import type { StepperItemProps } from "./StepperItem";

export interface StepperProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** `StepperItem` children, in order. Steps register by position, so a
   * Fragment counts as one step — pass the items directly. */
  children: ReactElement<StepperItemProps> | ReactElement<StepperItemProps>[];
  /** Names the list for assistive tech, e.g. "Order status" or "Checkout
   * progress". */
  accessibilityLabel: string;
  /** Defaults to "vertical" — a timeline with room for timestamps and
   * sub-events under each step. "horizontal" is a compact progress bar with
   * the label under each marker (checkout-style).
   *
   * Accepts `{ base, md, lg }` to switch by the Stepper's own width (600px /
   * 1024px, the same thresholds as Box's responsive props, read with a
   * container query) — e.g. `{ base: "vertical", md: "horizontal" }` for a
   * timeline in a phone-width column that becomes a progress bar once
   * there's room. */
  orientation?: Responsive<StepperOrientation>;
  /** What each marker shows. "icon": a check once completed, a plain dot
   * otherwise. "number": the step number, with a check once completed.
   * Defaults from the `base` orientation — "icon" for vertical, "number"
   * for horizontal — and stays the same across breakpoints, so markers
   * don't change meaning as the layout switches. */
  indicator?: StepperIndicator;
}

function isReached(status: StepperItemStatus | undefined): boolean {
  return status === "completed" || status === "current";
}

/** One class per tier that was actually given; an omitted `md`/`lg` just
 * leaves the tier below it in effect (stepper.css). */
function orientationClasses(orientation: Responsive<StepperOrientation>): string[] {
  if (typeof orientation === "string") return [`ds-stepper--${orientation}`];
  const classes = [`ds-stepper--${orientation.base ?? "vertical"}`];
  if (orientation.md) classes.push(`ds-stepper--md-${orientation.md}`);
  if (orientation.lg) classes.push(`ds-stepper--lg-${orientation.lg}`);
  return classes;
}

/**
 * A sequence of steps with their progress — an order-tracking timeline
 * (vertical) or a checkout progress bar (horizontal). Status is set per
 * item rather than derived from one `activeIndex`, since real data (an
 * order's status history) can mark any subset of steps complete, not only
 * a prefix.
 *
 * Responsive by the Stepper's own width, in CSS only (container queries —
 * see decisions/decision-stepper-responsive-orientation.md): orientation
 * can switch per breakpoint, markers shrink on a narrow horizontal bar,
 * and labels and timestamps wrap rather than overflow.
 */
export function Stepper({
  children,
  accessibilityLabel,
  orientation = "vertical",
  indicator,
  className,
  ...rest
}: StepperProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<StepperItemProps>[];
  const baseOrientation = typeof orientation === "string" ? orientation : (orientation.base ?? "vertical");
  const resolvedIndicator: StepperIndicator = indicator ?? (baseOrientation === "horizontal" ? "number" : "icon");
  const contextValue: StepperContextValue = { indicator: resolvedIndicator };

  const classes = [
    "ds-stepper",
    ...orientationClasses(orientation),
    `ds-stepper--indicator-${resolvedIndicator}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <StepperContext.Provider value={contextValue}>
      <div {...rest} className={classes}>
        <ol className="ds-stepper__list" aria-label={accessibilityLabel}>
          {items.map((item, index) => {
            const next = items[index + 1];
            const nextColor: StepperColor = next?.props.color ?? "primary";
            return (
              <StepperItemPositionContext.Provider
                key={item.key ?? index}
                value={{
                  index,
                  isLast: index === items.length - 1,
                  isNextReached: isReached(next?.props.status),
                  nextColor,
                }}
              >
                {item}
              </StepperItemPositionContext.Provider>
            );
          })}
        </ol>
      </div>
    </StepperContext.Provider>
  );
}
