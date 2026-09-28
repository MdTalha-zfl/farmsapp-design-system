import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useControllableState, useId } from "@farmsapp/utilities";
import { CollapsibleContext, type CollapsibleContextValue } from "./CollapsibleContext";

export interface CollapsibleProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Expects a `CollapsibleTrigger` and a `CollapsibleBody`, in either order. */
  children: ReactNode;
  /** Controlled open state. */
  isOpen?: boolean;
  /** Uncontrolled: whether it's open on first render. Defaults to false. */
  defaultIsOpen?: boolean;
  onOpenChange?: (change: { isOpen: boolean }) => void;
  /** A disabled Collapsible can't be toggled by the user, but a controlled
   * `isOpen` can still open/close it. */
  isDisabled?: boolean;
}

/**
 * A single open/close disclosure — no group semantics, unlike Accordion,
 * where opening one item closes the others. Reaches for this component
 * whenever exactly one thing needs to expand on its own (an order summary,
 * a "show more" block, a filter section), not a set of mutually-exclusive
 * items.
 */
export function Collapsible({
  children,
  isOpen: controlledIsOpen,
  defaultIsOpen = false,
  onOpenChange,
  isDisabled = false,
  className,
  ...rest
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    ...(controlledIsOpen !== undefined ? { value: controlledIsOpen } : {}),
    defaultValue: defaultIsOpen,
    onChange: (next) => onOpenChange?.({ isOpen: next }),
  });

  const baseId = `collapsible-${useId()}`;

  const contextValue: CollapsibleContextValue = {
    isOpen,
    isDisabled,
    toggle: () => {
      if (isDisabled) return;
      setIsOpen(!isOpen);
    },
    triggerId: `${baseId}-trigger`,
    panelId: `${baseId}-panel`,
  };

  const classes = [
    "ds-collapsible",
    isOpen ? "ds-collapsible--open" : undefined,
    isDisabled ? "ds-collapsible--disabled" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div {...rest} className={classes}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}
