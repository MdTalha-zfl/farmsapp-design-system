import { useContext, type ComponentPropsWithoutRef } from "react";
import { CarouselItemIndexContext, useCarouselContext } from "./CarouselContext";

export type CarouselItemProps = ComponentPropsWithoutRef<"div">;

/** One slide, usually holding an `<img>` (which fills the slide; see the
 * Carousel's `imageFit`). It announces itself to assistive tech as "N of M"
 * using the position Carousel gives it. */
export function CarouselItem({ className, children, ...rest }: CarouselItemProps) {
  const { count } = useCarouselContext();
  const index = useContext(CarouselItemIndexContext);
  const classes = ["ds-carousel__item", className].filter(Boolean).join(" ");
  return (
    <div
      {...rest}
      className={classes}
      role="group"
      aria-roledescription="slide"
      aria-label={index >= 0 ? `${index + 1} of ${count}` : undefined}
    >
      {children}
    </div>
  );
}
