import { createContext, useContext } from "react";
import type { ValidationState } from "../../Input/types";

export interface RadioGroupContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  validationState: ValidationState;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/**
 * Unlike Checkbox's `useCheckboxGroupContext` (which returns `null` outside
 * a group — a valid, standalone-usable state), a standalone `Radio` has no
 * `name` to group against and so has no real single-select behavior at
 * all — a structurally broken case, not a degraded-but-functional one.
 * This throws a real, clear error instead of the project's usual
 * warn-and-degrade convention. See decisions/decision-radio-group-mandatory-throws.md.
 */
export function useRadioGroupContext(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(
      "@farmsapp/design-system: Radio must be rendered inside a RadioGroup — a standalone Radio has no `name` " +
        "to group against and can't provide real single-select behavior.",
    );
  }
  return context;
}
