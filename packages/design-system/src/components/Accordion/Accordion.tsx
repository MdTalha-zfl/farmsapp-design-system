import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactElement } from "react";
import { useControllableState } from "@farmsapp/utilities";
import {
  AccordionContext,
  AccordionItemIndexContext,
  type AccordionContextValue,
  type AccordionSize,
  type AccordionVariant,
} from "./AccordionContext";

export interface AccordionProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Accepts `AccordionItem` children. */
  children: ReactElement | ReactElement[];
  /** Controlled: the expanded item's index. `-1` means none expanded. */
  expandedIndex?: number;
  /** Uncontrolled: the item expanded on first render. Defaults to none. */
  defaultExpandedIndex?: number;
  /** Fires with the new index; `-1` means the open item was collapsed. */
  onExpandChange?: (change: { expandedIndex: number }) => void;
  /** Defaults to "transparent". */
  variant?: AccordionVariant;
  /** Defaults to "large". */
  size?: AccordionSize;
  /** Prepends "1.", "2.", … to item titles. Ignored on an item that has a
   * `leading` element (dev-mode error) — the two can't be combined. */
  showNumberPrefix?: boolean;
}

/**
 * Single-expand accordion: at most one item is open at a time. State lives
 * here as one `expandedIndex`, not per item, which is what makes "opening
 * one closes the others" fall out for free.
 */
export function Accordion({
  children,
  expandedIndex: controlledIndex,
  defaultExpandedIndex = -1,
  onExpandChange,
  variant = "transparent",
  size = "large",
  showNumberPrefix = false,
  className,
  ...rest
}: AccordionProps) {
  const [expandedIndex, setExpandedIndex] = useControllableState<number>({
    ...(controlledIndex !== undefined ? { value: controlledIndex } : {}),
    defaultValue: defaultExpandedIndex,
    onChange: (next) => onExpandChange?.({ expandedIndex: next }),
  });

  const contextValue: AccordionContextValue = { expandedIndex, setExpandedIndex, variant, size, showNumberPrefix };

  const classes = ["ds-accordion", `ds-accordion--variant-${variant}`, className].filter(Boolean).join(" ");

  let itemIndex = 0;

  return (
    <AccordionContext.Provider value={contextValue}>
      <div {...rest} className={classes}>
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;
          return <AccordionItemIndexContext.Provider value={itemIndex++}>{child}</AccordionItemIndexContext.Provider>;
        })}
      </div>
    </AccordionContext.Provider>
  );
}
