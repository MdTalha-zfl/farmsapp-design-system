import type { ReactNode } from "react";
import { useTabsContext } from "./TabsContext";

export interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { baseId, selectedValue, isLazy } = useTabsContext();
  const isSelected = selectedValue === value;
  const tabItemId = `${baseId}-${value}-tabitem`;
  const tabPanelId = `${baseId}-${value}-tabpanel`;
  const classes = ["ds-tabs__panel", className].filter(Boolean).join(" ");

  if (isLazy) {
    if (!isSelected) return null;
    return (
      <div id={tabPanelId} role="tabpanel" aria-labelledby={tabItemId} className={classes}>
        {children}
      </div>
    );
  }

  return (
    <div id={tabPanelId} role="tabpanel" aria-labelledby={tabItemId} aria-hidden={!isSelected} className={classes}>
      {children}
    </div>
  );
}
