import { forwardRef, useRef, type FocusEvent, type KeyboardEvent } from "react";
import { XIcon } from "@farmsapp/icons";
import { BaseInput } from "../BaseInput/BaseInput";
import { IconButton } from "../../IconButton/IconButton";
import { CharacterCounter } from "../../CharacterCounter/CharacterCounter";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../types";
import type { Radius } from "../../Box/Box";

/**
 * TextArea — multi-line free text. Same prop surface as TextInput minus
 * icon/prefix/suffix/format concerns, plus `numberOfLines`. Tagged-input
 * mode is deferred (see TextInput's own note — same reasoning applies here).
 */

export interface TextAreaProps extends FormInputLabelProps, FormInputValidationProps {
  id: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange?: (e: { name?: string | undefined; value: string }) => void;
  onKeyDown?: (e: { name?: string | undefined; value: string; event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement> }) => void;

  isDisabled?: boolean;
  isRequired?: boolean;
  autoFocus?: boolean;

  /** Defaults to 2. */
  numberOfLines?: number;

  showClearButton?: boolean;
  onClearButtonClick?: () => void;

  maxCharacters?: number;

  accessibilityLabel?: string;
  hideLabelText?: boolean;
  hideFormHint?: boolean;

  size?: InputSize;
  borderRadius?: Radius;
  className?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    numberOfLines = 2,
    showClearButton = false,
    onClearButtonClick,
    isDisabled,
    value,
    defaultValue,
    maxCharacters,
    size = "medium",
    onChange,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const hasValue = Boolean(value ?? defaultValue);
  const showClear = showClearButton && hasValue && !isDisabled;

  const handleClear = () => {
    onClearButtonClick?.();
    if (value === undefined && innerRef.current) {
      innerRef.current.value = "";
      innerRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <BaseInput
      ref={(node) => {
        const textareaNode = node as HTMLTextAreaElement | null;
        innerRef.current = textareaNode;
        if (typeof ref === "function") ref(textareaNode);
        else if (ref) ref.current = textareaNode;
      }}
      as="textarea"
      numberOfLines={numberOfLines}
      isDisabled={isDisabled}
      value={value}
      defaultValue={defaultValue}
      maxCharacters={maxCharacters}
      size={size}
      trailingHeaderSlot={
        showClear
          ? () => (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton icon={XIcon} size="small" emphasis="subtle" accessibilityLabel="Clear text" onClick={handleClear} />
              </div>
            )
          : undefined
      }
      trailingFooterSlot={
        maxCharacters !== undefined
          ? (currentValue) => <CharacterCounter currentCount={(currentValue ?? "").length} maxCount={maxCharacters} size={size} />
          : undefined
      }
      onChange={(e) => onChange?.({ name: e.name, value: e.value })}
      {...props}
    />
  );
});
