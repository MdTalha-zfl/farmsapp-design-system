import { forwardRef, type ComponentType, type ElementType, type MouseEvent, type ReactElement, type Ref } from "react";
import type { IconOwnProps } from "@farmsapp/icons";
import { Text } from "../Text/Text";
import { Spinner } from "../Spinner/Spinner";
import { resolveBoxClassNames, type MarginProps } from "../Box/Box";
import { resolveBaseButtonState } from "./resolveBaseButtonState";


export type ButtonVariant = "primary" | "secondary" | "tertiary" | "negative";
export type ButtonSize = "xsmall" | "small" | "medium" | "large";
export type ButtonIconPosition = "left" | "right";

// Exported for IconButton's own reuse (see IconButton.tsx) — the icon
// component shape is identical for both, no reason to duplicate it.
export type ButtonIconComponent = ComponentType<IconOwnProps>;

interface BaseButtonCommonOwnProps extends MarginProps {
  /** Defaults to "primary". */
  variant?: ButtonVariant;
  /** Defaults to "medium". */
  size?: ButtonSize;
  icon?: ButtonIconComponent;
  /** Defaults to "left". */
  iconPosition?: ButtonIconPosition;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  isLoading?: boolean;
  /** Defaults to "button". Ignored when `href` is set (real `<a>` has no `type`). */
  type?: "button" | "reset" | "submit";
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
}

// Discriminated union, matching Blade's real ButtonWithIconProps/
// ButtonWithoutIconProps split, translated onto this project's icon-only
// accessible-naming answer (decisions/decision-icon-aria-hidden-unconditional.md's
// deferral, resolved here): when icon is present and children is absent,
// accessibilityLabel becomes the meaningful, required prop.
export interface BaseButtonWithChildrenOwnProps extends BaseButtonCommonOwnProps {
  children: string;
  accessibilityLabel?: string;
}
export interface BaseButtonIconOnlyOwnProps extends BaseButtonCommonOwnProps {
  icon: ButtonIconComponent;
  children?: undefined;
  accessibilityLabel: string;
}
export type BaseButtonOwnProps = BaseButtonWithChildrenOwnProps | BaseButtonIconOnlyOwnProps;

export const BaseButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, BaseButtonOwnProps>(function BaseButton(
  {
    variant = "primary",
    size = "medium",
    icon: Icon,
    iconPosition = "left",
    isDisabled = false,
    isFullWidth = false,
    isLoading = false,
    type = "button",
    href,
    target,
    rel,
    onClick,
    className,
    children,
    accessibilityLabel,
    ...marginProps
  },
  ref,
) {
  const childrenString = typeof children === "string" ? children : undefined;
  const isLink = Boolean(href);

  const { disabled, isIconOnly, iconSize, spinnerSize, textSize } = resolveBaseButtonState({
    size,
    hasIcon: Boolean(Icon),
    childrenString,
    isDisabled,
    isLoading,
    isLink,
    accessibilityLabel,
  });

  // Untyped as ElementType (matching Box.tsx's own `const Component = as ??
  // "div"` pattern) — a literal "a" | "button" union tag would make JSX's
  // per-attribute type-checking intersect each element's own allowed props
  // (rejecting `href` whenever `button` is possible, `disabled`/`type`
  // whenever `a` is possible). The native props below are built as a plain
  // record and spread, same reason Box.tsx's own `rest` is untyped.
  const Component = (isLink ? "a" : "button") as ElementType;

  const classes = [
    "ds-button",
    `ds-button--variant-${variant}`,
    `ds-button--size-${size}`,
    isIconOnly && "ds-button--icon-only",
    isFullWidth && "ds-button--full-width",
    ...resolveBoxClassNames(marginProps),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const nativeProps: Record<string, unknown> = {
    ref,
    type: isLink ? undefined : type,
    href,
    target,
    rel,
    disabled: isLink ? undefined : disabled,
    "aria-label": isIconOnly ? accessibilityLabel : undefined,
    onClick,
    className: classes,
  };

  return (
    <Component {...nativeProps}>
      {isLoading ? (
        <span className="ds-button__spinner-overlay">
          <Spinner size={spinnerSize} accessibilityLabel="Loading" />
        </span>
      ) : null}
      <span className={["ds-button__content", isLoading && "ds-button__content--hidden"].filter(Boolean).join(" ")}>
        {Icon && iconPosition === "left" ? <Icon size={iconSize} /> : null}
        {!isIconOnly ? (
          <Text as="span" variant="body" size={textSize} padding="0">
            {children}
          </Text>
        ) : null}
        {Icon && iconPosition === "right" ? <Icon size={iconSize} /> : null}
      </span>
    </Component>
  );
}) as (props: BaseButtonOwnProps & { ref?: Ref<HTMLButtonElement | HTMLAnchorElement> }) => ReactElement | null;
