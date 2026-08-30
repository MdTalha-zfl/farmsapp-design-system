import type { ReactElement } from "react";
import { AlertCircleIcon, CheckIcon, type IconOwnProps } from "@farmsapp/icons";
import type { ComponentType } from "react";
import { Text } from "../Text/Text";
import { Inline } from "../Inline/Inline";

export type FormHintType = "help" | "error" | "success";
export type FormHintSize = "xsmall" | "small" | "medium" | "large";

export interface FormHintProps {
  /** Which single message is currently shown — priority is always resolved
   * by the caller (error > success > help, per BaseInput), FormHint itself
   * just renders whichever `type` it's told to. */
  type: FormHintType;
  helpText?: string | undefined;
  errorText?: string | undefined;
  successText?: string | undefined;
  helpTextId?: string | undefined;
  errorTextId?: string | undefined;
  successTextId?: string | undefined;
  /** Defaults to "medium". */
  size?: FormHintSize | undefined;
}

const SIZE_TO_TEXT_SIZE: Record<FormHintSize, "xsmall" | "small"> = {
  xsmall: "xsmall",
  small: "xsmall",
  medium: "small",
  large: "small",
};

const SIZE_TO_ICON_SIZE: Record<FormHintSize, "small" | "medium"> = {
  xsmall: "small",
  small: "small",
  medium: "small",
  large: "medium",
};

const TYPE_TO_ICON: Partial<Record<FormHintType, ComponentType<IconOwnProps>>> = {
  error: AlertCircleIcon,
  success: CheckIcon,
};

export function FormHint({
  type,
  helpText,
  errorText,
  successText,
  helpTextId,
  errorTextId,
  successTextId,
  size = "medium",
}: FormHintProps): ReactElement | null {
  const textByType: Record<FormHintType, string | undefined> = {
    help: helpText,
    error: errorText,
    success: successText,
  };
  const idByType: Record<FormHintType, string | undefined> = {
    help: helpTextId,
    error: errorTextId,
    success: successTextId,
  };

  const text = textByType[type];
  if (!text) return null;

  const Icon = TYPE_TO_ICON[type];
  const color = type === "error" ? "danger" : type === "success" ? "success" : "secondary";

  return (
    <Inline gap="1" alignItems="center" className="ds-form-hint">
      {Icon ? <Icon size={SIZE_TO_ICON_SIZE[size]} color={color} /> : null}
      <Text as="span" id={idByType[type]} variant="caption" size={SIZE_TO_TEXT_SIZE[size]} color={color}>
        {text}
      </Text>
    </Inline>
  );
}
