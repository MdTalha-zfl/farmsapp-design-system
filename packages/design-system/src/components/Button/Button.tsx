import type { ReactElement, Ref } from "react";
import { BaseButton, type BaseButtonOwnProps, type ButtonVariant, type ButtonSize, type ButtonIconPosition } from "./BaseButton";

/**
 * Button — thin public wrapper around BaseButton, matching Blade's real
 * Button.tsx -> BaseButton.tsx split. Today ButtonOwnProps is identical to
 * BaseButtonOwnProps (this project has no internal-only consumer widening
 * BaseButton's surface yet) — the re-export exists for the structural seam,
 * not because the props differ yet. See decisions/decision-button-basebutton-split.md.
 */

export type { ButtonVariant, ButtonSize, ButtonIconPosition };
export type ButtonOwnProps = BaseButtonOwnProps;
export type { BaseButtonWithChildrenOwnProps as ButtonWithChildrenOwnProps, BaseButtonIconOnlyOwnProps as ButtonIconOnlyOwnProps } from "./BaseButton";

export const Button = BaseButton as (
  props: ButtonOwnProps & { ref?: Ref<HTMLButtonElement | HTMLAnchorElement> },
) => ReactElement | null;
