import { createContext, useContext } from "react";

export interface CarouselContextValue {
  /** Number of slides. */
  count: number;
}

export const CarouselContext = createContext<CarouselContextValue | null>(null);

/** Set by Carousel around each child, so CarouselItem can learn its own
 * position without the consumer passing an `index` prop by hand (same
 * approach as AccordionItemIndexContext). */
export const CarouselItemIndexContext = createContext<number>(-1);

const FALLBACK_CONTEXT: CarouselContextValue = { count: 0 };

/** Dev-mode warn-and-degrade (not throw) on misuse, matching this project's
 * standing convention (ModalContext, AccordionContext). */
export function useCarouselContext(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: CarouselItem must be rendered inside a Carousel. Rendering with inert fallback values instead of crashing.",
      );
    }
    return FALLBACK_CONTEXT;
  }
  return context;
}
