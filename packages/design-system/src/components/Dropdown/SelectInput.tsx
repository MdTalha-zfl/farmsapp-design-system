import { forwardRef, useLayoutEffect, type KeyboardEvent } from "react";
import { ChevronDownIcon } from "@farmsapp/icons";
import { useId } from "@farmsapp/utilities";
import type { ButtonIconComponent } from "../Button/BaseButton";
import { BaseInput } from "../Input/BaseInput/BaseInput";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../Input/types";
import { useDropdownContext } from "./DropdownContext";
import { SelectTag } from "./SelectTag";
import {
  SelectionFormInputs,
  useFieldReference,
  useSelectionState,
  type MultipleSelectionProps,
  type SingleSelectionProps,
} from "./selectionState";

interface SelectInputCommonProps extends FormInputLabelProps, FormInputValidationProps {
  id?: string;
  /** Names the hidden form input(s), and is echoed back in `onChange`. */
  name?: string;
  /** Shown while nothing is selected. */
  placeholder?: string;
  /** Blade's shape: `values` is always an array, even for a single select. */
  onChange?: (args: { name: string | undefined; values: string[] }) => void;
  icon?: ButtonIconComponent;
  isDisabled?: boolean;
  isRequired?: boolean;
  /** Defaults to "medium". */
  size?: InputSize;
}

/** A visible `label` or an `accessibilityLabel` is required, as with the
 * other inputs. */
export type SelectInputProps = SelectInputCommonProps &
  (SingleSelectionProps | MultipleSelectionProps) &
  ({ label: string; accessibilityLabel?: string } | { label?: undefined; accessibilityLabel: string });

/**
 * A field that opens a list and picks one value (or several). It goes inside
 * a Dropdown, beside a DropdownOverlay, and must be told about its own state:
 * the selection lives here (controlled or uncontrolled), and is published to
 * the Dropdown so the items can read and change it. The field shows the
 * chosen item's *title*, which the items report by value — so it is correct
 * before the list has ever been opened.
 */
export const SelectInput = forwardRef<HTMLButtonElement, SelectInputProps>(function SelectInput(props, forwardedRef) {
  const {
    id: idProp,
    name,
    placeholder,
    onChange,
    icon,
    isDisabled = false,
    isRequired = false,
    size = "medium",
    selectionType,
    value,
    defaultValue,
    ...rest
  } = props;
  // `maxRows` only exists on the multiple variant; pull it out so it never
  // reaches the field props.
  const { maxRows = "multiple", ...fieldProps } = rest as typeof rest & { maxRows?: "single" | "multiple" | "expandable" };

  const generatedId = useId();
  const id = idProp ?? generatedId;

  const { isMultiple, values, setValues, select } = useSelectionState({
    selectionType,
    value,
    defaultValue,
    name,
    onChange,
  });

  const { refs, getReferenceProps, registerTrigger, getOptionTitle } = useDropdownContext();

  // Publishing makes the Dropdown a "select": virtual focus, listbox roles,
  // panel as wide as this field.
  useLayoutEffect(() => {
    registerTrigger({ values, select, isMultiple, isTypeable: false });
  }, [registerTrigger, values, select, isMultiple]);
  useLayoutEffect(() => () => registerTrigger(null), [registerTrigger]);

  const { elementRef, setRef } = useFieldReference<HTMLButtonElement>(refs, forwardedRef);

  const removeValue = (target: string) => {
    setValues(values.filter((item) => item !== target));
    // The tag's own button is about to unmount; keep focus in the field.
    elementRef.current?.focus();
  };

  // Backspace on the field takes the last tag off, like a tag input.
  const referenceProps = getReferenceProps(
    isMultiple
      ? {
          onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Backspace" || values.length === 0 || isDisabled) return;
            event.preventDefault();
            setValues(values.slice(0, -1));
          },
        }
      : undefined,
  );

  const titleOf = (item: string) => getOptionTitle(item) ?? item;
  const selectedTitle = !isMultiple && values[0] !== undefined ? getOptionTitle(values[0]) : undefined;
  const showsPlaceholder = isMultiple ? values.length === 0 : selectedTitle === undefined;

  return (
    <>
      <BaseInput
        {...fieldProps}
        as="button"
        id={id}
        isDisabled={isDisabled}
        isRequired={isRequired}
        size={size}
        leadingIcon={icon}
        trailingIcon={ChevronDownIcon}
        buttonRef={setRef}
        buttonProps={referenceProps}
        buttonContent={isMultiple ? (showsPlaceholder ? (placeholder ?? "") : "") : (selectedTitle ?? placeholder ?? "")}
        isPlaceholderShown={showsPlaceholder}
        {...(isMultiple
          ? {
              tagRows: maxRows,
              buttonTags: values.map((item) => (
                <SelectTag key={item} title={titleOf(item)} isDisabled={isDisabled} onRemove={() => removeValue(item)} />
              )),
            }
          : {})}
      />
      <SelectionFormInputs name={name} values={values} isMultiple={isMultiple} />
    </>
  );
});
