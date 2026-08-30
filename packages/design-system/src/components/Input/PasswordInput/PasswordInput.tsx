import { forwardRef, useState, type FocusEvent, type Ref } from "react";
import { EyeIcon, EyeOffIcon } from "@farmsapp/icons";
import { BaseInput } from "../BaseInput/BaseInput";
import { IconButton } from "../../IconButton/IconButton";
import { CharacterCounter } from "../../CharacterCounter/CharacterCounter";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../types";
import type { Radius } from "../../Box/Box";
import type { NecessityIndicator } from "../types";

/**
 * PasswordInput — wraps BaseInput, owns the reveal/hide toggle. The toggle
 * flips the native `type` between "password" and "text" (never renders the
 * raw value in plain text via anything other than the real input type —
 * that's what makes it interoperate correctly with password managers and
 * browser autofill).
 */

export interface PasswordInputProps extends FormInputLabelProps, FormInputValidationProps {
  id: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange?: (e: { name?: string | undefined; value: string }) => void;

  isDisabled?: boolean;
  isRequired?: boolean;
  autoFocus?: boolean;

  /** Narrower than TextInput's necessityIndicator — Blade's real
   * PasswordInput has no "optional" password field concept. */
  necessityIndicator?: Extract<NecessityIndicator, "required" | "none">;

  /** Defaults to true. */
  showRevealButton?: boolean;
  /** Defaults to "none" (no browser autofill suggestion). */
  autoCompleteSuggestionType?: "none" | "password" | "newPassword";

  maxCharacters?: number;

  accessibilityLabel?: string;
  hideLabelText?: boolean;
  hideFormHint?: boolean;

  size?: InputSize;
  borderRadius?: Radius;
  className?: string;
}

const AUTOCOMPLETE_MAP: Record<NonNullable<PasswordInputProps["autoCompleteSuggestionType"]>, string | undefined> = {
  none: undefined,
  password: "current-password",
  newPassword: "new-password",
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { showRevealButton = true, autoCompleteSuggestionType = "none", isDisabled, maxCharacters, size = "medium", onChange, ...props },
  ref,
) {
  const [isRevealed, setIsRevealed] = useState(false);

  const canReveal = showRevealButton && !isDisabled;

  return (
    <BaseInput
      ref={ref as Ref<HTMLInputElement | HTMLTextAreaElement>}
      as="input"
      type={isRevealed && canReveal ? "text" : "password"}
      isDisabled={isDisabled}
      maxCharacters={maxCharacters}
      size={size}
      autoCapitalize="none"
      autoComplete={AUTOCOMPLETE_MAP[autoCompleteSuggestionType]}
      trailingInteractionElement={
        canReveal ? (
          <IconButton
            icon={isRevealed ? EyeOffIcon : EyeIcon}
            size="small"
            emphasis="subtle"
            accessibilityLabel={isRevealed ? "Hide password" : "Show password"}
            onClick={() => setIsRevealed((prev) => !prev)}
          />
        ) : undefined
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
