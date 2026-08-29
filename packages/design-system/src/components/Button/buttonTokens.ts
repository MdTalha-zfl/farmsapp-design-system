import type { IconSize } from "@farmsapp/icons";
import type { SpinnerSize } from "../Spinner/Spinner";
import type { BaseTextSizes } from "../Text/Text";
import type { ButtonSize } from "./BaseButton";

export const buttonSizeToIconSizeMap: Record<ButtonSize, IconSize> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "medium",
};

export const buttonIconOnlySizeToIconSizeMap: Record<ButtonSize, IconSize> = {
  xsmall: "medium",
  small: "medium",
  medium: "medium",
  large: "medium",
};

export const buttonSizeToSpinnerSizeMap: Record<ButtonSize, SpinnerSize> = {
  xsmall: "medium",
  small: "medium",
  medium: "medium",
  large: "large",
};

export const buttonSizeToTextSizeMap: Record<ButtonSize, BaseTextSizes> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "medium",
};
