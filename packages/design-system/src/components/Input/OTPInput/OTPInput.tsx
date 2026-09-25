import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ClipboardEvent,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useControllableState, useId } from "@farmsapp/utilities";
import { Stack } from "../../Stack/Stack";
import { Inline } from "../../Inline/Inline";
import { FormLabel } from "../../FormLabel/FormLabel";
import { FormHint } from "../../FormHint/FormHint";
import { useFormId } from "../../../utils/useFormId";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../types";

type OTPLength = 4 | 6 | 8;
type OTPCharacters = "numeric" | "alphanumeric";

interface OTPInputCommonProps extends FormInputLabelProps, FormInputValidationProps {
  id?: string;
  /** Defaults to 6. */
  otpLength?: OTPLength;
  /** What the code may contain; anything else is dropped as it is typed or
   * pasted. Defaults to "numeric". (Blade accepts any character, and only
   * hints a decimal keypad.) */
  characters?: OTPCharacters;
  /** Controlled code. `""` is a controlled, empty code (in Blade it counts as
   * uncontrolled). */
  value?: string;
  defaultValue?: string;
  /** `value` is the whole code so far, with no gaps. */
  onChange?: (args: { name: string | undefined; value: string }) => void;
  /** Fires when a change leaves the code complete (and different from before),
   * once per such change — not on mount, and not on every render. */
  onOTPFilled?: (args: { name: string | undefined; value: string }) => void;
  /** `value` is that one box's character; `inputIndex` is its position. */
  onFocus?: (args: { name: string | undefined; value: string; inputIndex: number }) => void;
  onBlur?: (args: { name: string | undefined; value: string; inputIndex: number }) => void;
  /** Shows a bullet instead of each entered character. */
  isMasked?: boolean;
  /** "oneTimeCode" (the default) lets the browser offer a code from an SMS. */
  autoCompleteSuggestionType?: "none" | "oneTimeCode";
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  /** One character shown in each empty box: "······" or "123456". */
  placeholder?: string;
  /** Names one hidden input carrying the whole code. (Blade puts the name on
   * every box as well, so a form submits it once per box.) */
  name?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** Sets `aria-required` on each box. */
  isRequired?: boolean;
  autoFocus?: boolean;
  /** Defaults to "medium". */
  size?: InputSize;
}

/** A visible `label` or an `accessibilityLabel` is required, as with the
 * other inputs. */
export type OTPInputProps = OTPInputCommonProps &
  ({ label: string; accessibilityLabel?: string } | { label?: undefined; accessibilityLabel: string });

/** Full-width digits and the like are normalised first (NFKC), then whatever is
 * not allowed is dropped. */
function sanitize(text: string, characters: OTPCharacters): string {
  const normalised = text.normalize("NFKC");
  return characters === "numeric" ? normalised.replace(/\D/g, "") : normalised.replace(/[^0-9a-zA-Z]/g, "");
}

/**
 * A one-time-code field: one box per character. Beneath the boxes the code is
 * one plain string, and box *i* shows character *i* — so there are never gaps
 * (deleting a character closes up the ones after it, as in a text field), and
 * a paste or an SMS autofill just fills from the box it landed in.
 *
 * Only one box is a Tab stop, the first empty one (the last, once full); the
 * arrow keys, Home and End move between boxes, and focusing an empty box past
 * the end hands focus to the first empty one.
 */
export const OTPInput = forwardRef<HTMLInputElement[], OTPInputProps>(function OTPInput(props, ref) {
  const {
    id: idProp,
    otpLength = 6,
    characters = "numeric",
    value: valueProp,
    defaultValue,
    onChange,
    onOTPFilled,
    onFocus,
    onBlur,
    isMasked = false,
    autoCompleteSuggestionType = "oneTimeCode",
    enterKeyHint,
    placeholder,
    name,
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    autoFocus = false,
    size = "medium",
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

  const [rawValue, setValue] = useControllableState<string>({
    ...(valueProp !== undefined ? { value: valueProp } : {}),
    defaultValue: defaultValue ?? "",
    onChange: (next) => onChange?.({ name, value: next }),
  });
  const value = sanitize(rawValue, characters).slice(0, otpLength);
  const chars = Array.from({ length: otpLength }, (_, index) => value[index] ?? "");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  // The array itself is stable; its entries are filled in as the boxes mount.
  useImperativeHandle(ref, () => inputRefs.current as HTMLInputElement[], []);

  // Focus moves the instant a change is committed, before React has rendered
  // it, so the focus handler must read the length from here, not from a stale
  // closure.
  const valueRef = useRef(value);
  valueRef.current = value;

  // The first empty box (the last, once full): where Tab enters the group and
  // where focus is sent when an empty box further along is focused.
  const resting = Math.min(value.length, otpLength - 1);

  // Roving Tab stop. Entering the group, Tab lands on `resting`; once a box has
  // focus it is the stop, so the next Tab leaves the group (were it always
  // `resting`, Tab from an earlier box would step forward inside the group).
  const groupRef = useRef<HTMLDivElement>(null);
  const [focusedBox, setFocusedBox] = useState<number | null>(null);

  const focusBox = (index: number) => inputRefs.current[Math.max(0, Math.min(index, otpLength - 1))]?.focus();

  useEffect(() => {
    if (autoFocus) inputRefs.current[Math.min(valueRef.current.length, otpLength - 1)]?.focus();
  }, [autoFocus, otpLength]);

  const commit = (next: string, focusIndex: number) => {
    const bounded = next.slice(0, otpLength);
    valueRef.current = bounded;
    if (bounded !== value) {
      setValue(bounded);
      if (bounded.length === otpLength) onOTPFilled?.({ name, value: bounded });
    }
    focusBox(Math.min(focusIndex, bounded.length));
  };

  const replaceAt = (index: number, character: string) => value.slice(0, index) + character + value.slice(index + 1);
  const removeAt = (index: number) => value.slice(0, index) + value.slice(index + 1);

  // A paste or an autofill. A whole code replaces everything; anything shorter
  // goes in from the box it landed in, dropping what was after it.
  const insertText = (text: string, index: number) => {
    if (text === "") return;
    const next = text.length >= otpLength ? text.slice(0, otpLength) : (value.slice(0, index) + text).slice(0, otpLength);
    commit(next, next.length);
  };

  const handleValueChange = (index: number, raw: string) => {
    const current = chars[index] ?? "";
    const clean = sanitize(raw, characters);
    if (raw === "") {
      // Emptied by cut, or by selecting and deleting.
      commit(removeAt(index), index);
    } else if (clean === "") {
      // Only characters that are not allowed: ignored (the box snaps back).
    } else if (clean.length === 1) {
      if (raw.length > 1) {
        // A disallowed character typed next to the one already there.
        if (clean !== current) commit(replaceAt(index, clean), index + 1);
      } else {
        commit(replaceAt(index, clean), index + 1);
      }
    } else if (current && clean.length === 2 && (clean[0] === current || clean[1] === current)) {
      // Typed into a filled box whose text was not selected: "5" then "7".
      commit(replaceAt(index, clean[0] === current ? (clean[1] ?? "") : (clean[0] ?? "")), index + 1);
    } else {
      insertText(clean, index);
    }
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    // Mid-composition (an IME) the text is not final yet.
    if ((event.nativeEvent as { isComposing?: boolean }).isComposing) return;
    handleValueChange(index, event.target.value);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
    switch (event.key) {
      case "Backspace":
        event.preventDefault();
        if (chars[index]) commit(removeAt(index), index);
        else if (index > 0) commit(removeAt(index - 1), index - 1);
        break;
      case "Delete":
        event.preventDefault();
        if (chars[index]) commit(removeAt(index), index);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusBox(index - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        focusBox(Math.min(index + 1, value.length));
        break;
      case "Home":
        event.preventDefault();
        focusBox(0);
        break;
      case "End":
        event.preventDefault();
        focusBox(value.length);
        break;
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    insertText(sanitize(event.clipboardData.getData("text"), characters), index);
  };

  const handleFocus = (index: number, event: FocusEvent<HTMLInputElement>) => {
    // The code has no gaps: an empty box further along hands focus back to the
    // first empty one.
    const current = Math.min(valueRef.current.length, otpLength - 1);
    if (index > current) {
      focusBox(current);
      return;
    }
    // Typing then replaces what is there rather than adding to it.
    event.currentTarget.select();
    setFocusedBox(index);
    onFocus?.({ name, value: chars[index] ?? "", inputIndex: index });
  };

  // Keeps the click that focused a box from clearing the selection made above.
  const keepSelection = (event: MouseEvent<HTMLInputElement>) => {
    if (document.activeElement === event.currentTarget) event.preventDefault();
  };

  const hintType =
    validationState === "error" && errorText
      ? "error"
      : validationState === "success" && successText
        ? "success"
        : helpText
          ? "help"
          : null;
  const hintId = hintType === "error" ? errorTextId : hintType === "success" ? successTextId : hintType === "help" ? helpTextId : undefined;

  const hasLabel = Boolean(label);
  const placeholderChars = Array.from(placeholder ?? "");

  const boxes = (
    <div
      ref={groupRef}
      role="group"
      className="ds-otp"
      {...(hasLabel ? { "aria-labelledby": labelId } : { "aria-label": accessibilityLabel })}
    >
      {chars.map((character, index) => {
        const isMaskedNow = isMasked && character !== "";
        return (
          <div
            key={index}
            className={[
              "ds-input-row",
              `ds-input-row--size-${size}`,
              "ds-input-row--radius-md",
              "ds-otp__box",
              `ds-otp__box--size-${size}`,
              isDisabled && "ds-input-row--disabled",
              validationState !== "none" && `ds-input-row--validation-${validationState}`,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              id={`${id}-${index}`}
              className="ds-input"
              // Masked boxes become a password field once they hold a
              // character, so the browser's own bullet is used (and the
              // password managers, which mostly ignore a one-character field,
              // are told to keep away below).
              type={isMaskedNow ? "password" : "text"}
              inputMode={characters === "numeric" ? "numeric" : "text"}
              autoComplete={isMaskedNow || autoCompleteSuggestionType === "none" ? "off" : "one-time-code"}
              enterKeyHint={enterKeyHint}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              // Room for a whole code, so an SMS autofill or a paste lands
              // intact and is split by handleValueChange (one character would
              // be cut by the browser).
              maxLength={otpLength}
              value={character}
              placeholder={placeholderChars[index]}
              disabled={isDisabled}
              readOnly={isReadOnly}
              tabIndex={index === (focusedBox ?? resting) ? 0 : -1}
              aria-label={`${characters === "numeric" ? "Digit" : "Character"} ${index + 1} of ${otpLength}`}
              aria-required={isRequired || undefined}
              aria-invalid={validationState === "error" || undefined}
              aria-describedby={hintId}
              onChange={(event) => handleChange(index, event)}
              onCompositionEnd={(event) => handleValueChange(index, event.currentTarget.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={(event) => handleFocus(index, event)}
              onBlur={(event) => {
                if (!groupRef.current?.contains(event.relatedTarget as Node | null)) setFocusedBox(null);
                onBlur?.({ name, value: character, inputIndex: index });
              }}
              onMouseUp={keepSelection}
            />
          </div>
        );
      })}
    </div>
  );

  const labelRow = hasLabel ? (
    <FormLabel
      id={labelId}
      htmlFor={`${id}-${resting}`}
      position={labelPosition}
      necessityIndicator={necessityIndicator}
      size={size === "xsmall" ? "small" : size}
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
    <Stack gap="1" className="ds-input-field">
      {labelPosition === "top" ? labelRow : null}
      {boxes}
      {hint}
      {name ? <input type="hidden" name={name} value={value} /> : null}
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
