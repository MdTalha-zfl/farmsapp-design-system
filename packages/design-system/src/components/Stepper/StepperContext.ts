import { createContext, useContext } from "react";

export type StepperOrientation = "vertical" | "horizontal";
export type StepperIndicator = "icon" | "number";
export type StepperItemStatus = "completed" | "current" | "upcoming";
export type StepperColor = "primary" | "success" | "warning" | "danger";

/** No `orientation`: it can differ per breakpoint and is resolved entirely
 * in CSS, so items render the same markup either way. */
export interface StepperContextValue {
  indicator: StepperIndicator;
}

/** Set by Stepper around each child. The connector leading *out of* a step
 * is filled when the *next* step has been reached, so an item needs to
 * know about its neighbour — Stepper reads that off its children once
 * rather than each item guessing. */
export interface StepperItemPosition {
  index: number;
  isLast: boolean;
  isNextReached: boolean;
  nextColor: StepperColor;
}

export const StepperContext = createContext<StepperContextValue | null>(null);
export const StepperItemPositionContext = createContext<StepperItemPosition | null>(null);

const FALLBACK_CONTEXT: StepperContextValue = { indicator: "icon" };
const FALLBACK_POSITION: StepperItemPosition = { index: 0, isLast: true, isNextReached: false, nextColor: "primary" };

/** Dev-mode warn-and-degrade (not throw) on misuse, matching this project's
 * standing convention (AccordionContext, CarouselContext). */
export function useStepperItemContext(): { stepper: StepperContextValue; position: StepperItemPosition } {
  const stepper = useContext(StepperContext);
  const position = useContext(StepperItemPositionContext);
  if (!stepper || !position) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: StepperItem must be rendered directly inside a Stepper. Rendering with inert fallback values instead of crashing.",
      );
    }
    return { stepper: stepper ?? FALLBACK_CONTEXT, position: position ?? FALLBACK_POSITION };
  }
  return { stepper, position };
}
