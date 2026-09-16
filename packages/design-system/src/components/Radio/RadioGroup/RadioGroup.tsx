import type { ReactNode } from "react";
import { useControllableState, useId } from "@farmsapp/utilities";
import { Text } from "../../Text/Text";
import { FormHint } from "../../FormHint/FormHint";
import type { ValidationState } from "../../Input/types";
import { RadioGroupContext } from "./RadioGroupContext";

export interface RadioGroupProps {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (state: { name: string; value: string }) => void;
  /** Defaults to "vertical". */
  orientation?: "horizontal" | "vertical";
  /** Cascades to every child Radio unless a child sets its own `isDisabled`. */
  isDisabled?: boolean;
  validationState?: ValidationState;
  helpText?: string;
  errorText?: string;
  children: ReactNode;
}

export function RadioGroup({
  label,
  name: providedName,
  value: controlledValue,
  defaultValue = "",
  onChange,
  orientation = "vertical",
  isDisabled = false,
  validationState = "none",
  helpText,
  errorText,
  children,
}: RadioGroupProps) {
  const [value, setValue] = useControllableState<string>({
    ...(controlledValue !== undefined ? { value: controlledValue } : {}),
    defaultValue,
  });
  const groupId = useId();
  // useId() is always called, unconditionally (its result is only used
  // when providedName is absent) — `providedName ?? \`...${useId()}\`` would
  // call useId() conditionally depending on providedName, violating the
  // Rules of Hooks since `??`'s right side only evaluates when needed.
  const generatedId = useId();
  const name = providedName ?? `radio-group-${generatedId}`;
  const hintType = validationState === "error" && errorText ? "error" : helpText ? "help" : null;

  function handleChange(nextValue: string) {
    setValue(nextValue);
    onChange?.({ name, value: nextValue });
  }

  return (
    <RadioGroupContext.Provider value={{ name, value, onChange: handleChange, isDisabled, validationState }}>
      <fieldset
        className="ds-radio-group"
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={hintType ? `${groupId}-${hintType}-text` : undefined}
      >
        <legend id={`${groupId}-label`} className="ds-radio-group__legend">
          <Text as="span" variant="body" size="medium" weight="medium">
            {label}
          </Text>
        </legend>
        <div className={`ds-radio-group__items ds-radio-group__items--${orientation}`}>{children}</div>
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
    </RadioGroupContext.Provider>
  );
}
