import { forwardRef, useEffect, useLayoutEffect, useRef, type ChangeEvent, type KeyboardEvent, type Ref } from "react";
import { useControllableState, useId } from "@farmsapp/utilities";
import type { ButtonIconComponent } from "../Button/BaseButton";
import { BaseInput } from "../Input/BaseInput/BaseInput";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../Input/types";
import { useDropdownContext } from "./DropdownContext";
import { SelectTag } from "./SelectTag";
import {
  SelectionFormInputs,
  useFieldReference,
  useSelectionState,
  useStableArray,
  type MultipleSelectionProps,
  type SingleSelectionProps,
} from "./selectionState";

interface AutoCompleteCommonProps extends FormInputLabelProps, FormInputValidationProps {
  id?: string;
  /** Names the hidden form input(s) that carry the chosen values, and is
   * echoed back in `onChange`. The typed text itself is never submitted. */
  name?: string;
  placeholder?: string;
  /** Fires with the chosen values (always an array, as SelectInput). */
  onChange?: (args: { name: string | undefined; values: string[] }) => void;
  /** The text in the box. Controlled with `inputValue`, uncontrolled with
   * `defaultInputValue`. You filter with it, so you will usually control it. */
  inputValue?: string;
  defaultInputValue?: string;
  /** Fires as the user types, and when the text resets (see below). */
  onInputValueChange?: (args: { name: string | undefined; value: string }) => void;
  /** The `value`s of the options to show; the others render nothing. Omit it
   * to show everything. AutoComplete never filters by itself — you decide
   * what matches (locally, or from a server) — but keeping the items mounted
   * and hiding them here means a chosen tag keeps its title while it is
   * filtered out, and lets AutoComplete announce the result count. */
  filteredValues?: string[];
  /** Shown when `filteredValues` is empty. Defaults to "No results found". */
  emptyMessage?: string;
  icon?: ButtonIconComponent;
  isDisabled?: boolean;
  isRequired?: boolean;
  /** Defaults to "medium". */
  size?: InputSize;
}

export type AutoCompleteProps = AutoCompleteCommonProps &
  (SingleSelectionProps | MultipleSelectionProps) &
  ({ label: string; accessibilityLabel?: string } | { label?: undefined; accessibilityLabel: string });

const DEFAULT_EMPTY_MESSAGE = "No results found";

/**
 * A text field that suggests options as you type. Like SelectInput it goes
 * inside a Dropdown beside a DropdownOverlay, and owns the selection. The
 * text is separate from the selection: it is scratch space for searching, and
 * whenever the list closes it resets to the selection (single: the chosen
 * option's title; multiple: empty) — so the value is always a real option.
 */
export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(props, forwardedRef) {
  const {
    id: idProp,
    name,
    placeholder,
    onChange,
    inputValue: inputValueProp,
    defaultInputValue,
    onInputValueChange,
    filteredValues,
    emptyMessage = DEFAULT_EMPTY_MESSAGE,
    icon,
    isDisabled = false,
    isRequired = false,
    size = "medium",
    selectionType,
    value,
    defaultValue,
    ...rest
  } = props;
  const { maxRows = "multiple", ...fieldProps } = rest as typeof rest & { maxRows?: "single" | "multiple" | "expandable" };

  const generatedId = useId();
  const id = idProp ?? generatedId;

  const { refs, getReferenceProps, registerTrigger, getOptionTitle, isOpen, setIsOpen, setActiveIndex } =
    useDropdownContext();

  const [inputValue, setInputValue] = useControllableState<string>({
    ...(inputValueProp !== undefined ? { value: inputValueProp } : {}),
    defaultValue: defaultInputValue ?? "",
    onChange: (next) => onInputValueChange?.({ name, value: next }),
  });

  // Picking in a multiple select clears the search, ready for the next value.
  const isMultipleSelection = selectionType === "multiple";
  const { isMultiple, values, setValues, select } = useSelectionState({
    selectionType,
    value,
    defaultValue,
    name,
    onChange,
    onSelect: isMultipleSelection ? () => setInputValue("") : undefined,
  });

  const stableFilteredValues = useStableArray(filteredValues);
  useLayoutEffect(() => {
    registerTrigger({ values, select, isMultiple, isTypeable: true, filteredValues: stableFilteredValues, emptyMessage });
  }, [registerTrigger, values, select, isMultiple, stableFilteredValues, emptyMessage]);
  useLayoutEffect(() => () => registerTrigger(null), [registerTrigger]);

  // While closed, the text shows the selection. This covers the first render
  // (a `defaultValue`'s title is only known once its item registers), a pick,
  // and Escape/Tab/outside-click abandoning a half-typed search. Typing always
  // opens the list, so it is never overwritten mid-search.
  const selectedTitle = !isMultiple && values[0] !== undefined ? getOptionTitle(values[0]) : undefined;
  useEffect(() => {
    if (isOpen) return;
    const resting = isMultiple ? "" : (selectedTitle ?? "");
    if (inputValue !== resting) setInputValue(resting);
  }, [isOpen, isMultiple, selectedTitle, inputValue, setInputValue]);

  const { elementRef, setRef } = useFieldReference<HTMLInputElement>(refs, forwardedRef);

  // Opening a single select whose box shows the chosen title selects that
  // text, so typing replaces it instead of extending it. (Not on focus: after
  // Escape the box keeps focus, and a click's mouseup would undo it.) Typing
  // opens the list too, but then the text is no longer the title.
  const restingRef = useRef({ inputValue, selectedTitle, isMultiple });
  restingRef.current = { inputValue, selectedTitle, isMultiple };
  useEffect(() => {
    if (!isOpen) return;
    const { inputValue: text, selectedTitle: title, isMultiple: multiple } = restingRef.current;
    const element = elementRef.current;
    if (!multiple && title !== undefined && text === title && element && document.activeElement === element) {
      element.select();
    }
  }, [isOpen, elementRef]);

  const removeValue = (target: string) => {
    setValues(values.filter((item) => item !== target));
    elementRef.current?.focus();
  };

  const referenceProps = getReferenceProps({
    onChange(event: ChangeEvent<HTMLInputElement>) {
      setInputValue(event.target.value);
      setIsOpen(true);
      // The old highlight pointed into a list that is about to change.
      setActiveIndex(null);
    },
    onKeyDown(event: KeyboardEvent) {
      // Backspace in an empty box takes the last tag off, like a tag input.
      if (event.key === "Backspace" && isMultiple && inputValue === "" && values.length > 0 && !isDisabled) {
        setValues(values.slice(0, -1));
      }
    },
  });

  const titleOf = (item: string) => getOptionTitle(item) ?? item;

  // Announces the result count. The container stays mounted so assistive tech
  // sees the text change; it only has content while the list is open.
  const announcement =
    isOpen && filteredValues !== undefined
      ? filteredValues.length === 0
        ? emptyMessage
        : `${filteredValues.length} ${filteredValues.length === 1 ? "result" : "results"} available`
      : "";

  return (
    <>
      <BaseInput
        {...fieldProps}
        as="input"
        id={id}
        ref={setRef as Ref<HTMLInputElement | HTMLTextAreaElement>}
        isDisabled={isDisabled}
        isRequired={isRequired}
        size={size}
        leadingIcon={icon}
        placeholder={isMultiple && values.length > 0 ? undefined : placeholder}
        value={inputValue}
        autoComplete="off"
        inputProps={referenceProps}
        {...(isMultiple
          ? {
              tagRows: maxRows,
              buttonTags: values.map((item) => (
                <SelectTag key={item} title={titleOf(item)} isDisabled={isDisabled} onRemove={() => removeValue(item)} />
              )),
            }
          : {})}
      />
      <div className="ds-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <SelectionFormInputs name={name} values={values} isMultiple={isMultiple} />
    </>
  );
});
