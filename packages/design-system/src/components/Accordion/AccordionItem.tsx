import { useContext, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useId } from "@farmsapp/utilities";
import {
  AccordionItemContext,
  AccordionItemIndexContext,
  useAccordionContext,
  type AccordionItemContextValue,
} from "./AccordionContext";

export interface AccordionItemProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Expects `AccordionItemHeader` first, `AccordionItemBody` second. */
  children: ReactNode;
  /** A disabled item can't be toggled, but a controlled `expandedIndex` can
   * still open it. */
  isDisabled?: boolean;
}

export function AccordionItem({ children, isDisabled = false, className, ...rest }: AccordionItemProps) {
  const { expandedIndex, setExpandedIndex } = useAccordionContext();
  const index = useContext(AccordionItemIndexContext);
  const baseId = `accordion-${useId()}`;

  const isExpanded = index === expandedIndex;

  const contextValue: AccordionItemContextValue = {
    index,
    isExpanded,
    isDisabled,
    triggerId: `${baseId}-trigger`,
    panelId: `${baseId}-panel`,
    toggle: () => setExpandedIndex(isExpanded ? -1 : index),
  };

  const classes = ["ds-accordion__item", isExpanded ? "ds-accordion__item--expanded" : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div {...rest} className={classes}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}
