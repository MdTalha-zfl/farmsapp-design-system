import { useState, type CSSProperties, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "@farmsapp/utilities";
import { useTabsContext } from "./TabsContext";

interface Dimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface TabIndicatorProps {
  containerRef: RefObject<HTMLElement | null>;
}

export function TabIndicator({ containerRef }: TabIndicatorProps) {
  const { baseId, selectedValue, variant, isVertical } = useTabsContext();
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useIsomorphicLayoutEffect(() => {
    function updateDimensions() {
      if (!selectedValue) return;
      const activeTabItem = document.getElementById(`${baseId}-${selectedValue}-tabitem`);
      if (!activeTabItem || activeTabItem.offsetWidth === 0) return;
      setDimensions({
        width: activeTabItem.offsetWidth,
        height: activeTabItem.offsetHeight,
        x: activeTabItem.offsetLeft,
        y: activeTabItem.offsetTop,
      });
      setShouldAnimate((prev) => {
        if (!prev) requestAnimationFrame(() => setShouldAnimate(true));
        return prev;
      });
    }

    updateDimensions();

    // Font load can shift measured widths after first paint — recalculate
    // once real fonts (incl. Devanagari) have finished loading, matching
    // Blade's real behavior.
    document.fonts?.ready?.then(updateDimensions).catch(() => {});

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [baseId, selectedValue, containerRef]);

  if (!dimensions) return null;

  const isFilled = variant === "filled";
 
  const style: CSSProperties = {
    transform: `translate(${dimensions.x}px, ${dimensions.y}px)`,
    transitionDuration: shouldAnimate ? "var(--ds-duration-fast)" : "0ms",
    width: isFilled || !isVertical ? dimensions.width : undefined,
    height: isFilled || isVertical ? dimensions.height : undefined,
  };

  return <div className={`ds-tabs__indicator ds-tabs__indicator--variant-${variant}`} style={style} />;
}
