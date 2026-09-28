import { createContext, useContext } from "react";

export interface CollapsibleContextValue {
  isOpen: boolean;
  isDisabled: boolean;
  toggle: () => void;
  triggerId: string;
  panelId: string;
}

export const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

const FALLBACK_CONTEXT: CollapsibleContextValue = {
  isOpen: false,
  isDisabled: false,
  toggle: () => {},
  triggerId: "ds-collapsible-fallback-trigger",
  panelId: "ds-collapsible-fallback-panel",
};

/** Dev-mode warn-and-degrade (not throw) on misuse, matching this project's
 * standing convention (AccordionContext, ModalContext, TabsContext). */
export function useCollapsibleContext(): CollapsibleContextValue {
  const context = useContext(CollapsibleContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: CollapsibleTrigger/CollapsibleBody must be rendered inside a Collapsible. Rendering with inert fallback values instead of crashing.",
      );
    }
    return FALLBACK_CONTEXT;
  }
  return context;
}
