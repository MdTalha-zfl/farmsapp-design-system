import {
  forwardRef,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentType,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import type { IconOwnProps } from "@farmsapp/icons";
import type { Radius } from "../../Box/Box";
import { Stack } from "../../Stack/Stack";
import { Inline } from "../../Inline/Inline";
import { FormLabel } from "../../FormLabel/FormLabel";
import { FormHint } from "../../FormHint/FormHint";
import { useFormId } from "../../../utils/useFormId";
import { makeAccessible } from "../../../utils/makeAccessible";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../types";

/**
 * BaseInput — internal, not exported from index.tsx. Owns every piece of
 * rendering shared by TextInput/PasswordInput/SearchInput/TextArea: label,
 * hint/error/success text, leading/trailing icon or slot rendering, the
 * bordered field container and its focus/invalid/disabled states, the
 * character-counter footer slot, and the actual `<input>`/`<textarea>`
 * element. Public components pick a subset of this prop surface and
 * forward it — none of them re-render this structure themselves.
 */

export type BaseInputFieldElement = "input" | "textarea" | "button";
export type BaseInputNativeType = "text" | "tel" | "email" | "url" | "number" | "search" | "password";

export interface BaseInputProps extends FormInputLabelProps, FormInputValidationProps {
  as?: BaseInputFieldElement | undefined;
  id: string;
  name?: string | undefined;
  placeholder?: string | undefined;
  type?: BaseInputNativeType | undefined;
  defaultValue?: string | undefined;
  value?: string | undefined;
  onFocus?: ((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void) | undefined;
  onBlur?: ((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void) | undefined;
  onChange?: ((e: { name?: string | undefined; value: string; event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> }) => void) | undefined;
  onClick?: ((e: MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => void) | undefined;
  onInput?: ((e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void) | undefined;
  onKeyDown?:
    | ((e: { name?: string | undefined; value: string; event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement> }) => void)
    | undefined;
  onPaste?: ((e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void) | undefined;

  isDisabled?: boolean | undefined;
  isRequired?: boolean | undefined;
  autoFocus?: boolean | undefined;
  autoCapitalize?: ("none" | "sentences" | "words" | "characters") | undefined;
  /** Maps directly to the native `autocomplete` attribute. */
  autoComplete?: string | undefined;

  leadingIcon?: ComponentType<IconOwnProps> | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  trailingIcon?: ComponentType<IconOwnProps> | undefined;
  /** Arbitrary interactive node injected at the start/end of the field
   * (clear button, spinner, country selector). */
  leadingInteractionElement?: ReactNode;
  trailingInteractionElement?: ReactNode;

  maxCharacters?: number | undefined;
  textAlign?: ("left" | "center" | "right") | undefined;
  /** Maps to the native `inputmode` attribute. */
  keyboardType?: ("text" | "search" | "tel" | "email" | "url" | "decimal") | undefined;

  trailingHeaderSlot?: ((value: string | undefined) => ReactNode) | undefined;
  /** Rendered right-aligned in the footer row, alongside FormHint. Used by
   * public components to inject CharacterCounter. */
  trailingFooterSlot?: ((value: string | undefined) => ReactNode) | undefined;

  /** textarea only. */
  numberOfLines?: number | undefined;

  /**
   * `as="button"` only (SelectInput). The field is a `<button>` showing
   * `buttonContent`; `buttonProps` is merged onto it (a Dropdown's trigger
   * wiring: role, aria-expanded, key handlers, …), and `buttonRef` receives it.
   * A separate ref rather than widening this component's forwardRef type,
   * which would ripple into every wrapper that types its own ref.
   */
  buttonContent?: ReactNode;
  buttonProps?: Record<string, unknown> | undefined;
  buttonRef?: Ref<HTMLButtonElement> | undefined;
  /** True when `buttonContent` is the placeholder, so it is dimmed. */
  isPlaceholderShown?: boolean | undefined;
  /** `as="input"` only (AutoComplete): merged onto the `<input>` after this
   * component's own handlers, so it wins — a Dropdown's trigger wiring (role,
   * aria-expanded, key handlers, …). */
  inputProps?: Record<string, unknown> | undefined;
  /** A multiple select/AutoComplete: removable tags rendered in the field
   * before the button/input, wrapping according to `tagRows`. */
  buttonTags?: ReactNode;
  tagRows?: "single" | "multiple" | "expandable" | undefined;

  accessibilityLabel?: string | undefined;
  /** Hides the visible FormLabel text while keeping it (or
   * `accessibilityLabel`) available to assistive tech. */
  hideLabelText?: boolean | undefined;
  hideFormHint?: boolean | undefined;

  hasPopup?: boolean | undefined;
  popupId?: string | undefined;
  isPopupExpanded?: boolean | undefined;
  activeDescendant?: string | undefined;

  /** Defaults to "medium". */
  size?: InputSize | undefined;
  /** Defaults to "md". Reuses Box's own Radius scale rather than inventing
   * a parallel 5-step one — see decisions/decision-box-must-use-css-custom-properties.md's
   * precedent of every component sharing one token vocabulary. */
  borderRadius?: Radius | undefined;

  className?: string | undefined;
}

const ICON_SIZE_BY_INPUT_SIZE: Record<InputSize, "small" | "medium" | "large"> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "large",
};

const LABEL_SIZE_BY_INPUT_SIZE: Record<InputSize, "xsmall" | "small" | "medium" | "large"> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "large",
};

export const BaseInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, BaseInputProps>(function BaseInput(
  {
    as = "input",
    id,
    name,
    placeholder,
    type = "text",
    defaultValue,
    value,
    onFocus,
    onBlur,
    onChange,
    onClick,
    onInput,
    onKeyDown,
    onPaste,
    isDisabled = false,
    isRequired = false,
    autoFocus,
    autoCapitalize,
    autoComplete,
    leadingIcon: LeadingIcon,
    prefix,
    suffix,
    trailingIcon: TrailingIcon,
    leadingInteractionElement,
    trailingInteractionElement,
    maxCharacters,
    textAlign,
    keyboardType,
    trailingHeaderSlot,
    trailingFooterSlot,
    numberOfLines,
    buttonContent,
    buttonProps,
    buttonRef,
    isPlaceholderShown = false,
    inputProps,
    buttonTags,
    tagRows = "multiple",
    accessibilityLabel,
    hideLabelText,
    hideFormHint,
    hasPopup,
    popupId,
    isPopupExpanded,
    activeDescendant,
    size = "medium",
    borderRadius = "md",
    label,
    labelPosition = "top",
    necessityIndicator = "none",
    labelSuffix,
    labelTrailing,
    validationState = "none",
    helpText,
    errorText,
    successText,
    className,
  },
  ref,
) {
  const { labelId, helpTextId, errorTextId, successTextId } = useFormId(id);

  // error > success > help — resolved once, here, rather than in every
  // public wrapper.
  const hintType = validationState === "error" && errorText ? "error" : validationState === "success" && successText ? "success" : helpText ? "help" : null;

  const showCounter = maxCharacters !== undefined;
  const counterId = `${id}-counter`;

  const accessibleAttrs = makeAccessible({
    isRequired,
    isDisabled,
    isInvalid: validationState === "error",
    describedByIds: [
      hintType === "error" && errorTextId,
      hintType === "success" && successTextId,
      hintType === "help" && helpTextId,
      showCounter && counterId,
    ],
    accessibilityLabel: !label || hideLabelText ? accessibilityLabel : undefined,
    hasPopup,
    popupId,
    isPopupExpanded,
    activeDescendant,
  });

  const hasLabel = Boolean(label) && !hideLabelText;

  const fieldClasses = [
    "ds-input-row",
    `ds-input-row--size-${size}`,
    `ds-input-row--radius-${borderRadius}`,
    isDisabled && "ds-input-row--disabled",
    validationState !== "none" && `ds-input-row--validation-${validationState}`,
  ]
    .filter(Boolean)
    .join(" ");

  const fieldElementProps = {
    id,
    name,
    placeholder,
    disabled: isDisabled,
    autoFocus,
    autoCapitalize,
    autoComplete,
    inputMode: keyboardType,
    className: "ds-input",
    style: textAlign ? { textAlign } : undefined,
    onFocus,
    onBlur,
    onClick,
    onInput,
    onPaste,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange?.({ name, value: e.target.value, event: e }),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onKeyDown?.({ name, value: (e.target as HTMLInputElement | HTMLTextAreaElement).value, event: e }),
    ...(value !== undefined ? { value } : { defaultValue }),
    ...accessibleAttrs,
  } as const;

  const buttonField = (
    <button
      {...accessibleAttrs}
      {...buttonProps}
      ref={buttonRef}
      id={id}
      type="button"
      disabled={isDisabled}
      className={["ds-input", isPlaceholderShown && "ds-input--placeholder"].filter(Boolean).join(" ")}
    >
      <span className="ds-input-button-text">{buttonContent}</span>
    </button>
  );

  const bareField =
    as === "button" ? (
      buttonField
    ) : as === "textarea" ? (
      <textarea {...fieldElementProps} ref={ref as Ref<HTMLTextAreaElement>} rows={numberOfLines ?? 2} />
    ) : (
      <input
        {...fieldElementProps}
        {...inputProps}
        ref={ref as Ref<HTMLInputElement>}
        type={type}
        maxLength={maxCharacters}
      />
    );
  // Defined (even if empty) means multiple mode: keep the wrapper mounted so
  // the input/button is not re-created — and focus lost — when the first tag
  // is added or the last removed.
  const field = buttonTags !== undefined ? (
    <div className={`ds-input-tags ds-input-tags--${tagRows}`}>
      {buttonTags}
      {bareField}
    </div>
  ) : (
    bareField
  );

  const labelRow = hasLabel ? (
    <FormLabel
      id={labelId}
      htmlFor={id}
      position={labelPosition}
      necessityIndicator={necessityIndicator}
      size={LABEL_SIZE_BY_INPUT_SIZE[size]}
      labelSuffix={labelSuffix}
      labelTrailing={labelTrailing}
    >
      {label}
    </FormLabel>
  ) : null;

  const footerRow =
    !hideFormHint && (hintType || showCounter) ? (
      <Inline gap="2" justifyContent="between" alignItems="start" className="ds-input-footer-row">
        {hintType ? (
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
        ) : (
          <span />
        )}
        {trailingFooterSlot ? trailingFooterSlot(value ?? defaultValue) : null}
      </Inline>
    ) : null;

  const content = (
    <Stack gap="1" className={["ds-input-field", className].filter(Boolean).join(" ")}>
      {labelPosition === "top" ? labelRow : null}
      <Inline gap="0" alignItems="stretch" className={fieldClasses}>
        {LeadingIcon || prefix || leadingInteractionElement ? (
          <span className="ds-input-adornment ds-input-adornment--leading">
            {LeadingIcon ? <LeadingIcon size={ICON_SIZE_BY_INPUT_SIZE[size]} color="secondary" /> : null}
            {prefix ? <span className="ds-input-affix">{prefix}</span> : null}
            {leadingInteractionElement}
          </span>
        ) : null}
        {field}
        {suffix || TrailingIcon || trailingInteractionElement ? (
          <span className="ds-input-adornment ds-input-adornment--trailing">
            {suffix ? <span className="ds-input-affix">{suffix}</span> : null}
            {trailingInteractionElement}
            {TrailingIcon ? <TrailingIcon size={ICON_SIZE_BY_INPUT_SIZE[size]} color="secondary" /> : null}
          </span>
        ) : null}
      </Inline>
      {trailingHeaderSlot ? trailingHeaderSlot(value ?? defaultValue) : null}
      {footerRow}
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
