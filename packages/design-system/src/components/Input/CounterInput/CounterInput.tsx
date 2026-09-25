import { forwardRef, useImperativeHandle, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { MinusIcon, PlusIcon } from "@farmsapp/icons";
import { useId } from "@farmsapp/utilities";
import { Stack } from "../../Stack/Stack";
import { Inline } from "../../Inline/Inline";
import { FormLabel } from "../../FormLabel/FormLabel";
import { FormHint } from "../../FormHint/FormHint";
import { IconButton } from "../../IconButton/IconButton";
import { useFormId } from "../../../utils/useFormId";
import { makeAccessible } from "../../../utils/makeAccessible";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../types";
import { widestDigitCount } from "./counterMath";
import { useCounter } from "./useCounter";

interface CounterInputCommonProps extends FormInputLabelProps, FormInputValidationProps {
  id?: string;
  /** Names one hidden input carrying the *committed* value (empty string when
   * the field is empty), so a form never submits a half-typed draft. */
  name?: string;
  /** Controlled value. `null` is a controlled, empty field. */
  value?: number | null;
  defaultValue?: number | null;
  /** Defaults to 0, so negatives are off unless `min` is negative. */
  min?: number;
  max?: number;
  /** A positive integer; defaults to 1. The field is integer-only for now. */
  step?: number;
  /** Used by PageUp/PageDown. Defaults to `step * 10`. */
  pageStep?: number;
  /** Fires when the committed value changes — on blur, Enter, a button press
   * or a step key, never per keystroke. `value` is `null` when the field was
   * left empty. */
  onChange?: (args: { name: string | undefined; value: number | null }) => void;
  onFocus?: (args: { name: string | undefined; value: number | null }) => void;
  /** Fires after the draft has been committed. */
  onBlur?: (args: { name: string | undefined; value: number | null }) => void;
  isDisabled?: boolean;
  /** Sets `aria-required` on the field. */
  isRequired?: boolean;
  /** Defaults to "medium". */
  size?: InputSize;
  /** Defaults to "Decrease value". Override for a translated UI. */
  decrementAccessibilityLabel?: string;
  /** Defaults to "Increase value". Override for a translated UI. */
  incrementAccessibilityLabel?: string;
  className?: string;
}

/** A visible `label` or an `accessibilityLabel` is required, as with the
 * other inputs. */
export type CounterInputProps = CounterInputCommonProps &
  ({ label: string; accessibilityLabel?: string } | { label?: undefined; accessibilityLabel: string });

const ICON_SIZE_BY_SIZE: Record<InputSize, "small" | "medium" | "large"> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "large",
};

/**
 * A numeric stepper: a `−` button, an editable integer field, a `+` button.
 *
 * Typing is a draft; it is parsed, clamped to `[min, max]` and committed on
 * blur or Enter (and the buttons and arrow keys step from what is in the
 * field). An empty field is a real state (`null`), not `min`. The logic lives
 * in `useCounter`; this file is markup, refs and focus. See
 * decisions/decision-counterinput-*.md.
 */
export const CounterInput = forwardRef<HTMLInputElement, CounterInputProps>(function CounterInput(props, ref) {
  const {
    id: idProp,
    name,
    value: valueProp,
    defaultValue,
    min,
    max,
    step,
    pageStep,
    onChange,
    onFocus,
    onBlur,
    isDisabled = false,
    isRequired = false,
    size = "medium",
    decrementAccessibilityLabel = "Decrease value",
    incrementAccessibilityLabel = "Increase value",
    className,
    label,
    accessibilityLabel,
    labelPosition = "top",
    necessityIndicator = "none",
    labelSuffix,
    labelTrailing,
    validationState = "none",
    helpText,
    errorText,
    successText,
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { labelId, helpTextId, errorTextId, successTextId } = useFormId(id);

  const counter = useCounter({
    value: valueProp,
    defaultValue,
    min,
    max,
    step,
    pageStep,
    isDisabled,
    onChange: (next) => onChange?.({ name, value: next }),
  });

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const decrementRef = useRef<HTMLButtonElement>(null);
  const incrementRef = useRef<HTMLButtonElement>(null);

  // Focus is on a button when it is pressed, so the spinbutton's own value
  // change is not read out; this region says it instead.
  const [announcement, setAnnouncement] = useState("");

  // A press that reaches a bound disables the pressed button; while it has
  // focus that would drop focus to the page. Hand it to the other button (not
  // the field: that would open the keyboard on a touch device).
  const step1 = (direction: "increment" | "decrement") => {
    const pressed = direction === "increment" ? incrementRef.current : decrementRef.current;
    const other = direction === "increment" ? decrementRef.current : incrementRef.current;
    const next = direction === "increment" ? counter.increment() : counter.decrement();
    setAnnouncement(next === null ? "" : String(next));
    const reachedBound =
      next !== null && (direction === "increment" ? counter.max !== undefined && next >= counter.max : next <= counter.min);
    if (reachedBound && document.activeElement === pressed) other?.focus();
  };

  const hintType =
    validationState === "error" && errorText
      ? "error"
      : validationState === "success" && successText
        ? "success"
        : helpText
          ? "help"
          : null;

  const hasLabel = Boolean(label);

  const accessibleAttrs = makeAccessible({
    isRequired,
    isInvalid: validationState === "error",
    describedByIds: [
      hintType === "error" && errorTextId,
      hintType === "success" && successTextId,
      hintType === "help" && helpTextId,
    ],
    accessibilityLabel: hasLabel ? undefined : accessibilityLabel,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (counter.handleKeyDown(event.key)) event.preventDefault();
  };

  const rowClasses = [
    "ds-input-row",
    `ds-input-row--size-${size}`,
    "ds-input-row--radius-md",
    "ds-counter",
    `ds-counter--size-${size}`,
    isDisabled && "ds-input-row--disabled",
    validationState !== "none" && `ds-input-row--validation-${validationState}`,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = ICON_SIZE_BY_SIZE[size];

  const row = (
    <div
      className={rowClasses}
      style={{ "--ds-counter-digits": widestDigitCount(counter.min, counter.max) } as CSSProperties}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setAnnouncement("");
      }}
    >
      <IconButton
        ref={decrementRef}
        icon={MinusIcon}
        size={iconSize}
        accessibilityLabel={decrementAccessibilityLabel}
        isDisabled={counter.isDecrementDisabled}
        className="ds-counter__button"
        onClick={() => step1("decrement")}
      />
      <input
        ref={inputRef}
        id={id}
        className="ds-input ds-counter__input"
        type="text"
        // iOS's numeric pad has no minus key.
        inputMode={counter.min < 0 ? "text" : "numeric"}
        role="spinbutton"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={counter.inputValue}
        disabled={isDisabled}
        aria-valuemin={counter.min}
        aria-valuemax={counter.max}
        aria-valuenow={counter.value ?? undefined}
        {...accessibleAttrs}
        onChange={(event) => counter.handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocus?.({ name, value: counter.value })}
        onBlur={() => {
          // Commit before notifying: `onBlur?.(…)` would skip evaluating its
          // arguments (and so the commit) whenever no onBlur was passed.
          const committed = counter.commitDraft();
          onBlur?.({ name, value: committed });
        }}
      />
      <IconButton
        ref={incrementRef}
        icon={PlusIcon}
        size={iconSize}
        accessibilityLabel={incrementAccessibilityLabel}
        isDisabled={counter.isIncrementDisabled}
        className="ds-counter__button"
        onClick={() => step1("increment")}
      />
    </div>
  );

  const labelRow = hasLabel ? (
    <FormLabel
      id={labelId}
      htmlFor={id}
      position={labelPosition}
      necessityIndicator={necessityIndicator}
      size={size}
      labelSuffix={labelSuffix}
      labelTrailing={labelTrailing}
    >
      {label}
    </FormLabel>
  ) : null;

  const hint = hintType ? (
    // An error is announced when it appears; help and success text are not.
    <div role={hintType === "error" ? "alert" : undefined}>
      <FormHint
        type={hintType}
        helpText={helpText}
        errorText={errorText}
        successText={successText}
        helpTextId={helpTextId}
        errorTextId={errorTextId}
        successTextId={successTextId}
        size={size}
      />
    </div>
  ) : null;

  const content = (
    <Stack gap="1" className={["ds-input-field", className].filter(Boolean).join(" ")}>
      {labelPosition === "top" ? labelRow : null}
      {row}
      {hint}
      <span className="ds-visually-hidden" role="status">
        {announcement}
      </span>
      {name ? <input type="hidden" name={name} value={counter.value ?? ""} /> : null}
    </Stack>
  );

  if (labelPosition === "left" && hasLabel) {
    return (
      <Inline gap="3" alignItems="start" className="ds-input-field-row--label-left">
        {labelRow}
        <div style={{ flex: 1, minWidth: 0 }}>{content}</div>
      </Inline>
    );
  }
  return content;
});
