import { useRef, type ReactNode } from "react";
import { Composite } from "@floating-ui/react";
import { useTabsContext } from "./TabsContext";
import { TabIndicator } from "./TabIndicator";

export interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const { isVertical, variant } = useTabsContext();
  const containerRef = useRef<HTMLElement>(null);

  const classes = [
    "ds-tabs__list",
    `ds-tabs__list--variant-${variant}`,
    isVertical ? "ds-tabs__list--vertical" : "ds-tabs__list--horizontal",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Composite
      ref={containerRef}
      role="tablist"
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      orientation={isVertical ? "vertical" : "horizontal"}
      className={classes}
    >
      {children}
      <TabIndicator containerRef={containerRef} />
    </Composite>
  );
}
