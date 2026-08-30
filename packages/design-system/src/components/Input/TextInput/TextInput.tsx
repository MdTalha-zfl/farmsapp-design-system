import { forwardRef, isValidElement, type ComponentType, type FocusEvent, type ReactElement, type ReactNode, type Ref } from "react";
import { XIcon, type IconOwnProps } from "@farmsapp/icons";
import { BaseInput, type BaseInputNativeType } from "../BaseInput/BaseInput";
import { IconButton } from "../../IconButton/IconButton";
import { Spinner } from "../../Spinner/Spinner";
import { Divider } from "../../Divider/Divider";
import { CharacterCounter } from "../../CharacterCounter/CharacterCounter";
import type { FormInputLabelProps, FormInputValidationProps, InputSize } from "../types";
import type { Radius } from "../../Box/Box";

export type TextInputType = Extract<BaseInputNativeType, "text" | "email" | "url" | "number" | "tel">;

export interface TextInputProps extends FormInputLabelProps, FormInputValidationProps {
  id: string;
  name?: string;
  placeholder?: string;
  type?: TextInputType;
  defaultValue?: string;
  value?: string;
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange?: (e: { name?: string | undefined; value: string }) => void;

  isDisabled?: boolean;
  isRequired?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;

  /** An icon component, or a full element (e.g. a dropdown trigger). */
  leading?: ComponentType<IconOwnProps> | ReactElement;
  trailing?: ComponentType<IconOwnProps> | ReactElement;
  prefix?: string;
  suffix?: string;

  showClearButton?: boolean;
  onClearButtonClick?: () => void;
  isLoading?: boolean;

  maxCharacters?: number;
  textAlign?: "left" | "center" | "right";

  accessibilityLabel?: string;
  hideLabelText?: boolean;
  hideFormHint?: boolean;

  size?: InputSize;
  borderRadius?: Radius;
  className?: string;
}

function resolveSlot(slot: ComponentType<IconOwnProps> | ReactElement | undefined): {
  icon?: ComponentType<IconOwnProps>;
  element?: ReactNode;
} {
  if (!slot) return {};
  if (isValidElement(slot)) return { element: slot };
  return { icon: slot as ComponentType<IconOwnProps> };
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    leading,
    trailing,
    showClearButton = false,
    onClearButtonClick,
    isLoading = false,
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
  const { icon: leadingIcon, element: leadingInteractionElement } = resolveSlot(leading);
  const { icon: trailingIcon, element: trailingElement } = resolveSlot(trailing);

  const hasValue = Boolean(value ?? defaultValue);
  const showClear = showClearButton && hasValue && !isDisabled;

  const trailingInteractionElement = (
    <>
      {isLoading ? <Spinner size={size === "large" ? "medium" : "small"} accessibilityLabel="Loading" /> : null}
      {showClear ? (
        <IconButton icon={XIcon} size="small" emphasis="subtle" accessibilityLabel="Clear input" onClick={() => onClearButtonClick?.()} />
      ) : null}
      {showClear && trailingElement ? <Divider orientation="vertical" height="16px" /> : null}
      {trailingElement}
    </>
  );

  return (
    <BaseInput
      ref={ref as Ref<HTMLInputElement | HTMLTextAreaElement>}
      as="input"
      isDisabled={isDisabled}
      value={value}
      defaultValue={defaultValue}
      maxCharacters={maxCharacters}
      size={size}
      leadingIcon={leadingIcon}
      leadingInteractionElement={leadingInteractionElement}
      trailingIcon={trailingIcon}
      trailingInteractionElement={isLoading || showClear || trailingElement ? trailingInteractionElement : undefined}
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
