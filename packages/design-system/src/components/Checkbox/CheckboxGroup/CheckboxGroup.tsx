import type { ReactNode } from "react";
import { useControllableState, useId } from "@farmsapp/utilities";
import { Text } from "../../Text/Text";
import { FormHint } from "../../FormHint/FormHint";
import type { ValidationState } from "../../Input/types";
import { CheckboxGroupContext } from "./CheckboxGroupContext";

export interface CheckboxGroupProps {
  label: string;
  /** Defaults to "vertical". */
  orientation?: "horizontal" | "vertical";
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (state: { name: string | undefined; values: string[] }) => void;
  /** Cascades to every child Checkbox unless a child sets its own `isDisabled`. */
  isDisabled?: boolean;
  validationState?: ValidationState;
  helpText?: string;
  errorText?: string;
  children: ReactNode;
}

export function CheckboxGroup({
  label,
  orientation = "vertical",
  name,
  value: controlledValue,
  defaultValue = [],
  onChange,
  isDisabled = false,
  validationState = "none",
  helpText,
  errorText,
  children,
}: CheckboxGroupProps) {
  const [values, setValues] = useControllableState<string[]>({
    ...(controlledValue !== undefined ? { value: controlledValue } : {}),
    defaultValue,
  });
  const groupId = useId();
  const hintType = validationState === "error" && errorText ? "error" : helpText ? "help" : null;

  function toggleValue(toggled: string) {
    const next = values.includes(toggled) ? values.filter((v) => v !== toggled) : [...values, toggled];
    setValues(next);
    onChange?.({ name, values: next });
  }

  return (
    <CheckboxGroupContext.Provider value={{ values, toggleValue, isDisabled, validationState, name }}>
      <fieldset className="ds-checkbox-group" aria-describedby={hintType ? `${groupId}-${hintType}-text` : undefined}>
        <legend id={`${groupId}-label`} className="ds-checkbox-group__legend">
          <Text as="span" variant="body" size="medium" weight="medium">
            {label}
          </Text>
        </legend>
        <div className={`ds-checkbox-group__items ds-checkbox-group__items--${orientation}`}>{children}</div>
        {hintType ? (
          <FormHint
            type={hintType}
            helpText={helpText}
            errorText={errorText}
            helpTextId={`${groupId}-help-text`}
            errorTextId={`${groupId}-error-text`}
          />
        ) : null}
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}
