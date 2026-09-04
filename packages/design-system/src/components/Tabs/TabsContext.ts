import { createContext, useContext } from "react";
import type { ControllableStateSetter } from "@farmsapp/utilities";
import type { TabsSize, TabsVariant } from "./Tabs";

export interface TabsContextValue {
  size: TabsSize;
  variant: TabsVariant;
  isFullWidthTabItem: boolean;
  isLazy: boolean;
  isVertical: boolean;
  baseId: string;
  selectedValue: string;
  setSelectedValue: ControllableStateSetter<string>;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

const FALLBACK_CONTEXT: TabsContextValue = {
  size: "medium",
  variant: "bordered",
  isFullWidthTabItem: false,
  isLazy: false,
  isVertical: false,
  baseId: "ds-tabs-fallback",
  selectedValue: "",
  setSelectedValue: () => {},
};

export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: TabList/TabItem/TabPanel must be used within a <Tabs> component. Rendering with inert fallback values instead of crashing.",
      );
    }
    return FALLBACK_CONTEXT;
  }
  return context;
}
