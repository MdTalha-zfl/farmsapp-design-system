import { createContext, useContext } from "react";
import type { ControllableStateSetter } from "@farmsapp/utilities";

export type AccordionVariant = "filled" | "transparent";
export type AccordionSize = "large" | "medium";

export interface AccordionContextValue {
  /** -1 means no item is expanded. */
  expandedIndex: number;
  setExpandedIndex: ControllableStateSetter<number>;
  variant: AccordionVariant;
  size: AccordionSize;
  showNumberPrefix: boolean;
}

export interface AccordionItemContextValue {
  index: number;
  isExpanded: boolean;
  isDisabled: boolean;
  triggerId: string;
  panelId: string;
  toggle: () => void;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

/** Set by Accordion around each child, so AccordionItem can learn its own
 * position without the consumer passing an `index` prop by hand. */
export const AccordionItemIndexContext = createContext<number>(-1);

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const FALLBACK_ACCORDION_CONTEXT: AccordionContextValue = {
  expandedIndex: -1,
  setExpandedIndex: () => {},
  variant: "transparent",
  size: "large",
  showNumberPrefix: false,
};

const FALLBACK_ITEM_CONTEXT: AccordionItemContextValue = {
  index: 0,
  isExpanded: false,
  isDisabled: false,
  triggerId: "ds-accordion-fallback-trigger",
  panelId: "ds-accordion-fallback-panel",
  toggle: () => {},
};

/** Dev-mode warn-and-degrade (not throw) on misuse, matching this project's
 * standing convention (ModalContext, TabsContext). */
export function useAccordionContext(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: AccordionItem must be rendered inside an Accordion. Rendering with inert fallback values instead of crashing.",
      );
    }
    return FALLBACK_ACCORDION_CONTEXT;
  }
  return context;
}

export function useAccordionItemContext(): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: AccordionItemHeader/AccordionItemBody must be rendered inside an AccordionItem. Rendering with inert fallback values instead of crashing.",
      );
    }
    return FALLBACK_ITEM_CONTEXT;
  }
  return context;
}
