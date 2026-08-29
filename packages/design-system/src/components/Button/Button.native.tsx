import type { ReactElement, Ref } from "react";
import { BaseButton, type BaseButtonNativeOwnProps, type ButtonRef } from "./BaseButton.native";
import type { ButtonVariant, ButtonSize } from "./BaseButton";

export type { ButtonVariant, ButtonSize };
export type ButtonNativeProps = BaseButtonNativeOwnProps;

export const Button = BaseButton as (props: ButtonNativeProps & { ref?: Ref<ButtonRef> }) => ReactElement | null;
