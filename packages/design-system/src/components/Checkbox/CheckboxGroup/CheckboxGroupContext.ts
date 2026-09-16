import { createContext, useContext } from "react";
import type { ValidationState } from "../../Input/types";

export interface CheckboxGroupContextValue {
  values: string[];
  toggleValue: (value: string) => void;
  isDisabled: boolean;
  validationState: ValidationState;
  name?: string | undefined;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}
