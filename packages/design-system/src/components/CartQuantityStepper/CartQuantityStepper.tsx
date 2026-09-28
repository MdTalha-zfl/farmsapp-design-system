import { useRef, useState } from "react";
import { MinusIcon, PlusIcon, TrashIcon } from "@farmsapp/icons";
import { IconButton } from "../IconButton/IconButton";
import { RollingDigits } from "../RollingDigits/RollingDigits";
import { useCounter } from "../Input/CounterInput/useCounter";
import type { InputSize } from "../Input/types";

const ICON_SIZE_BY_SIZE: Record<InputSize, "small" | "medium" | "large"> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "large",
};

export interface CartQuantityStepperProps {
  /** Controlled value. */
  value?: number;
  defaultValue?: number;
  /** Defaults to 1 — a cart line has no "0 of an item" state; going below
   * this is a removal, not a decrement. */
  min?: number;
  max?: number;
  /** A positive integer; defaults to 1. */
  step?: number;
  onChange?: (value: number) => void;
  /** Defaults to false. When true, the decrement button becomes a trash
   * button once `value` reaches `min` — same spot, so the tap target
   * doesn't move. */
  showTrashIcon?: boolean;
  /** Fires when the trash button is pressed. Required when `showTrashIcon`
   * is true; this component does not remove anything itself. */
  onRemove?: () => void;
  isDisabled?: boolean;
  /** Defaults to "medium". Same size scale and button widths as
   * CounterInput's +/- buttons. */
  size?: InputSize;
  decrementAccessibilityLabel?: string;
  incrementAccessibilityLabel?: string;
  removeAccessibilityLabel?: string;
  className?: string;
}

/**
 * A plain-text quantity stepper for a product card or cart line — a filled
 * `+`/`-` square either side of the number, no bordered field, nothing
 * editable. With `showTrashIcon`, the `-` button turns into a trash button
 * at `min` instead of disabling, since on a cart line reaching the floor
 * means "remove the line," not "stop here."
 */
export function CartQuantityStepper({
  value: valueProp,
  defaultValue,
  min = 1,
  max,
  step,
  onChange,
  showTrashIcon = false,
  onRemove,
  isDisabled = false,
  size = "medium",
  decrementAccessibilityLabel = "Decrease quantity",
  incrementAccessibilityLabel = "Increase quantity",
  removeAccessibilityLabel = "Remove item",
  className,
}: CartQuantityStepperProps) {
  const counter = useCounter({
    value: valueProp,
    defaultValue: defaultValue ?? min,
    min,
    max,
    step,
    isDisabled,
    onChange: (next) => {
      if (next !== null) onChange?.(next);
    },
  });

  const decrementRef = useRef<HTMLButtonElement>(null);
  const incrementRef = useRef<HTMLButtonElement>(null);

  // Mirrors CounterInput: a press that reaches a bound disables the pressed
  // button; while it has focus that would drop focus to the page.
  const [announcement, setAnnouncement] = useState("");
  const step1 = (direction: "increment" | "decrement") => {
    const pressed = direction === "increment" ? incrementRef.current : decrementRef.current;
    const other = direction === "increment" ? decrementRef.current : incrementRef.current;
    const next = direction === "increment" ? counter.increment() : counter.decrement();
    setAnnouncement(next === null ? "" : String(next));
    const reachedBound =
      next !== null && (direction === "increment" ? counter.max !== undefined && next >= counter.max : next <= counter.min);
    if (reachedBound && document.activeElement === pressed) other?.focus();
  };

  // Matches CounterInput's own icon-size mapping.
  const iconSize = ICON_SIZE_BY_SIZE[size];
  const isAtMin = counter.value !== null && counter.value <= counter.min;
  const showTrash = showTrashIcon && isAtMin;

  const rowClasses = [
    "ds-cart-quantity-stepper",
    `ds-cart-quantity-stepper--size-${size}`,
    isDisabled && "ds-cart-quantity-stepper--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClasses}>
      {showTrash ? (
        <IconButton
          icon={TrashIcon}
          size={iconSize}
          accessibilityLabel={removeAccessibilityLabel}
          isDisabled={isDisabled}
          className="ds-cart-quantity-stepper__button ds-cart-quantity-stepper__button--trash"
          onClick={() => onRemove?.()}
        />
      ) : (
        <IconButton
          ref={decrementRef}
          icon={MinusIcon}
          size={iconSize}
          accessibilityLabel={decrementAccessibilityLabel}
          isDisabled={counter.isDecrementDisabled}
          className="ds-cart-quantity-stepper__button"
          onClick={() => step1("decrement")}
        />
      )}
      <span className="ds-cart-quantity-stepper__value" aria-live="off">
        <RollingDigits value={counter.value ?? min} fontSize="var(--ds-font-size-small)" />
      </span>
      <IconButton
        ref={incrementRef}
        icon={PlusIcon}
        size={iconSize}
        accessibilityLabel={incrementAccessibilityLabel}
        isDisabled={counter.isIncrementDisabled}
        className="ds-cart-quantity-stepper__button"
        onClick={() => step1("increment")}
      />
      <span className="ds-visually-hidden" role="status">
        {announcement}
      </span>
    </div>
  );
}
