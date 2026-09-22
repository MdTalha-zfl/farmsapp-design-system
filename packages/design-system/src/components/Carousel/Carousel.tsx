import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactElement,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@farmsapp/icons";
import { useControllableState } from "@farmsapp/utilities";
import { IconButton } from "../IconButton/IconButton";
import { CarouselContext, CarouselItemIndexContext, type CarouselContextValue } from "./CarouselContext";

export type CarouselImageFit = "cover" | "contain";

export interface CarouselProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange"> {
  /** `CarouselItem` children. Slides register by position, so a Fragment
   * counts as one slide — pass the items directly. */
  children: ReactElement | ReactElement[];
  /** Names the carousel for assistive tech, e.g. "Product photos". */
  accessibilityLabel: string;
  /** Controlled: the visible slide's index. */
  activeIndex?: number;
  /** Uncontrolled: the slide shown on first render. Defaults to 0. */
  defaultActiveIndex?: number;
  /** Fires when the visible slide changes — by swipe, keyboard or arrow. */
  onChange?: (change: { activeIndex: number }) => void;
  /** CSS aspect-ratio of the slides. Defaults to "16 / 9". */
  aspectRatio?: string;
  /** How an image fills its slide. "cover" crops to fill; "contain" shows
   * the whole image. Defaults to "cover". */
  imageFit?: CarouselImageFit;
  /** Previous/next buttons over the slides. Defaults to true. */
  showArrows?: boolean;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Image carousel built on native CSS scroll-snap: the track is a horizontal
 * scroll container, so swiping, trackpads and keyboard scrolling are handled
 * by the browser (off the main thread — cheap on low-end phones). React only
 * *reads* the scroll position to know which slide is showing, and scrolls the
 * track when a button or a controlled `activeIndex` asks it to.
 */
export function Carousel({
  children,
  accessibilityLabel,
  activeIndex: controlledIndex,
  defaultActiveIndex = 0,
  onChange,
  aspectRatio = "16 / 9",
  imageFit = "cover",
  showArrows = true,
  className,
  style,
  ...rest
}: CarouselProps) {
  const slides = Children.toArray(children).filter(isValidElement);
  const count = slides.length;

  const [activeIndex, setActiveIndex] = useControllableState<number>({
    ...(controlledIndex !== undefined ? { value: controlledIndex } : {}),
    defaultValue: defaultActiveIndex,
    onChange: (next) => onChange?.({ activeIndex: next }),
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const isFirstSync = useRef(true);

  // Which slide the track is currently showing. Slides are exactly one track
  // wide, so it is scroll distance / width (`abs` because RTL scrolls negative).
  const readIndex = useCallback((): number => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return 0;
    const index = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
    return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  }, [count]);

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
    track.scrollTo({
      left: sign * index * track.clientWidth,
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
    });
  }, []);

  // Scroll events fire many times per frame; sync state at most once a frame.
  const handleScroll = () => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      setActiveIndex(readIndex());
    });
  };
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Bring the track to `activeIndex` when it isn't already there: the first
  // render (defaultActiveIndex, instant) and a controlled change from the
  // parent (smooth). When the track itself moved, they already agree — no-op.
  useLayoutEffect(() => {
    const isFirst = isFirstSync.current;
    isFirstSync.current = false;
    if (readIndex() !== activeIndex) scrollToIndex(activeIndex, !isFirst);
  }, [activeIndex, readIndex, scrollToIndex]);

  const contextValue: CarouselContextValue = { count };
  const classes = ["ds-carousel", `ds-carousel--fit-${imageFit}`, className].filter(Boolean).join(" ");
  const rootStyle = { ...style, "--ds-carousel-aspect-ratio": aspectRatio } as CSSProperties;

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        {...rest}
        className={classes}
        style={rootStyle}
        role="region"
        aria-roledescription="carousel"
        aria-label={accessibilityLabel}
      >
        {/* Focusable so the arrow keys scroll it natively. */}
        <div ref={trackRef} className="ds-carousel__track" tabIndex={0} onScroll={handleScroll}>
          {slides.map((slide, index) => (
            <CarouselItemIndexContext.Provider key={slide.key ?? index} value={index}>
              {slide}
            </CarouselItemIndexContext.Provider>
          ))}
        </div>
        {showArrows && count > 1 ? (
          <>
            <IconButton
              className="ds-carousel__arrow ds-carousel__arrow--prev"
              icon={ChevronLeftIcon}
              isHighlighted
              accessibilityLabel="Previous slide"
              isDisabled={activeIndex <= 0}
              onClick={() => scrollToIndex(activeIndex - 1, true)}
            />
            <IconButton
              className="ds-carousel__arrow ds-carousel__arrow--next"
              icon={ChevronRightIcon}
              isHighlighted
              accessibilityLabel="Next slide"
              isDisabled={activeIndex >= count - 1}
              onClick={() => scrollToIndex(activeIndex + 1, true)}
            />
          </>
        ) : null}
      </div>
    </CarouselContext.Provider>
  );
}
