import type { ReactNode } from "react";
import { useId } from "@farmsapp/utilities";
import { Selector, type SelectorSize } from "../Selector/Selector";
import { useRadioGroupContext } from "./RadioGroup/RadioGroupContext";

/**
 * Radio — always group-controlled, no standalone mode (unlike Checkbox).
 * Every visual/interactive prop (`checked`, `name`, `onChange`) comes from
 * `RadioGroupContext`; `Radio` itself carries only what identifies and
 * decorates this one option (`value`, `isDisabled`, `size`, `trailing`,
 * label `children`). Native `<input type="radio" name="...">` grouping
 * handles all keyboard navigation (arrow keys move selection between
 * radios sharing a `name`) — zero custom keyboard code, confirmed directly
 * from Blade's real source. See decisions/decision-radio-no-keyboard-code.md.
 */

export interface RadioProps {
  value: string;
  isDisabled?: boolean;
  /** Defaults to "medium". */
  size?: SelectorSize;
  trailing?: ReactNode;
  children?: ReactNode;
}

export function Radio({ value, isDisabled = false, size = "medium", trailing, children }: RadioProps) {
  const group = useRadioGroupContext();
  const id = useId();
  const isDisabledResolved = isDisabled || group.isDisabled;
  const isChecked = group.value === value;

  return (
    <Selector
      type="radio"
      id={id}
      size={size}
      isDisabled={isDisabledResolved}
      isInvalid={group.validationState === "error"}
      name={group.name}
      value={value}
      checked={isChecked}
      onChange={() => group.onChange(value)}
      role="radio"
      aria-checked={isChecked}
      labelClassName="ds-radio__label"
      visual={<span className="ds-radio__circle" />}
    >
      {children}
      {trailing ? <span className="ds-radio__trailing">{trailing}</span> : null}
    </Selector>
  );
}
