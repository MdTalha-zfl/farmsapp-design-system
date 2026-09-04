import type { ReactNode } from "react";
import { useControllableState, useId } from "@farmsapp/utilities";
import { TabsContext } from "./TabsContext";

/**
 *
 * Keyboard roving-tabindex is delegated to @floating-ui/react's
 * Composite/CompositeItem inside TabList/TabItem
 */

export type TabsOrientation = "horizontal" | "vertical";
export type TabsSize = "small" | "medium" | "large";

export type TabsVariant = "bordered" | "borderless" | "filled";

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: TabsOrientation;
  size?: TabsSize;
  variant?: TabsVariant;
  isFullWidthTabItem?: boolean;
  isLazy?: boolean;
  children: ReactNode;
}

export function Tabs({
  value: controlledValue,
  defaultValue = "",
  onChange,
  orientation = "horizontal",
  size = "medium",
  variant = "bordered",
  isFullWidthTabItem = false,
  isLazy = false,
  children,
}: TabsProps) {
  const [selectedValue, setSelectedValue] = useControllableState<string>({
    ...(controlledValue !== undefined ? { value: controlledValue } : {}),
    defaultValue,
    ...(onChange ? { onChange } : {}),
  });
 
  const baseId = `tabs-${useId()}`;

  return (
    <TabsContext.Provider
      value={{
        size,
        variant,
        isFullWidthTabItem,
        isLazy,
        isVertical: orientation === "vertical",
        baseId,
        selectedValue,
        setSelectedValue,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}
