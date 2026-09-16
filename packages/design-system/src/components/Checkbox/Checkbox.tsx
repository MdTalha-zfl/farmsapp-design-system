import { forwardRef, useEffect, useRef, type ChangeEvent, type ReactNode } from "react";
import { CheckIcon, MinusIcon } from "@farmsapp/icons";
import { useControllableState, useId, useMergeRefs } from "@farmsapp/utilities";
import { Selector, type SelectorSize } from "../Selector/Selector";
import { FormHint } from "../FormHint/FormHint";
import { resolveBoxClassNames, type MarginProps } from "../Box/Box";
import type { ValidationState } from "../Input/types";
import { useCheckboxGroupContext } from "./CheckboxGroup/CheckboxGroupContext";

export interface CheckboxProps extends MarginProps {
  isChecked?: boolean;
  defaultChecked?: boolean;
  onChange?: (state: { isChecked: boolean; event: ChangeEvent<HTMLInputElement> }) => void;
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  /** Defaults to "none". Ignored (with a dev warning) inside a CheckboxGroup. */
  validationState?: ValidationState;
  helpText?: string;
  errorText?: string;
  /** Defaults to "medium". */
  size?: SelectorSize;
  /** Ignored (with a dev warning) inside a CheckboxGroup — the group's own
   * `name` is used for every child instead. */
  name?: string;
  /** Required inside a CheckboxGroup (identifies this checkbox within the
   * group's `value` array); optional standalone. */
  value?: string;
  children?: ReactNode;
  className?: string;
}

function warnIfGroupControlledPropSet(propNames: string[]): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    `@farmsapp/design-system: Checkbox received ${propNames.join(", ")} while rendered inside a CheckboxGroup — ` +
      "these become group-controlled and this value is ignored. Set them on CheckboxGroup instead.",
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    isChecked: controlledChecked,
    defaultChecked = false,
    onChange,
    isIndeterminate = false,
    isDisabled = false,
    isRequired = false,
    validationState = "none",
    helpText,
    errorText,
    size = "medium",
    name,
    value,
    children,
    className,
    ...marginProps
  },
  forwardedRef,
) {
  const group = useCheckboxGroupContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs(inputRef, forwardedRef);
  const id = useId();

  if (process.env.NODE_ENV !== "production" && group) {
    const invalidProps: string[] = [];
    if (controlledChecked !== undefined) invalidProps.push("isChecked");
    if (defaultChecked) invalidProps.push("defaultChecked");
    if (onChange) invalidProps.push("onChange");
    if (validationState !== "none") invalidProps.push("validationState");
    if (name !== undefined) invalidProps.push("name");
    if (invalidProps.length > 0) warnIfGroupControlledPropSet(invalidProps);
  }

  // Public onChange needs the real ChangeEvent, which useControllableState's
  // own onChange (value-only) can't carry — called directly in
  // handleChange instead, with skipUpdate:false letting the setter still
  // sync internal state without a duplicate onChange firing here.
  const [uncontrolledChecked, setUncontrolledChecked] = useControllableState<boolean>({
    ...(controlledChecked !== undefined ? { value: controlledChecked } : {}),
    defaultValue: defaultChecked,
  });

  const isChecked = group ? (value !== undefined && group.values.includes(value)) : uncontrolledChecked;
  const isDisabledResolved = isDisabled || group?.isDisabled || false;
  const resolvedValidationState = group ? group.validationState : validationState;
  const resolvedName = group ? group.name : name;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (group) {
      if (value !== undefined) group.toggleValue(value);
      return;
    }
    setUncontrolledChecked(event.target.checked);
    onChange?.({ isChecked: event.target.checked, event });
  }

  const hintType = resolvedValidationState === "error" && errorText ? "error" : helpText ? "help" : null;

  const visualClasses = ["ds-checkbox__box"].filter(Boolean).join(" ");

  return (
    <span className={["ds-checkbox", ...resolveBoxClassNames(marginProps)].filter(Boolean).join(" ")}>
      <Selector
        ref={mergedRef}
        type="checkbox"
        id={id}
        size={size}
        isDisabled={isDisabledResolved}
        isInvalid={resolvedValidationState === "error"}
        required={isRequired}
        name={resolvedName}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        aria-checked={isIndeterminate ? "mixed" : undefined}
        aria-describedby={hintType ? `${id}-${hintType}-text` : undefined}
        className={className}
        labelClassName="ds-checkbox__label"
        visual={
          <span className={visualClasses}>
            <CheckIcon size="small" color="inverse" className="ds-checkbox__icon ds-checkbox__icon--check" />
            <MinusIcon size="small" color="inverse" className="ds-checkbox__icon ds-checkbox__icon--indeterminate" />
          </span>
        }
      >
        {children}
      </Selector>
      {hintType ? (
        <FormHint
          type={hintType}
          helpText={helpText}
          errorText={errorText}
          helpTextId={`${id}-help-text`}
          errorTextId={`${id}-error-text`}
        />
      ) : null}
    </span>
  );
});
