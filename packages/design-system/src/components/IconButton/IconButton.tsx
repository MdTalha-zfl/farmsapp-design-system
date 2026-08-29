import { forwardRef, type MouseEvent } from "react";
import type { ButtonIconComponent } from "../Button/BaseButton";
import { resolveBoxClassNames, type MarginProps } from "../Box/Box";

/**
 * IconButton — genuinely separate from BaseButton/Button, matching Blade's
 * real structure exactly (confirmed directly from Blade's source and
 * explanation this session): no shared internals, its own color model
 * (emphasis/isHighlighted instead of variant/color), its own default shape
 * (transparent, unboxed by default vs. Button's bordered/filled box), its
 * own 3-step size scale (no xsmall). See
 * decisions/decision-iconbutton-separate-from-basebutton.md.
 *
 * "Component for making clickable icons with transparent background. For
 * other cases please use Button component with icon prop." — Blade's own
 * real JSDoc, matched here.
 */

export type IconButtonEmphasis = "subtle" | "intense" | "moderate";
export type IconButtonSize = "small" | "medium" | "large";

export interface IconButtonProps extends MarginProps {
  icon: ButtonIconComponent;
  /** Defaults to "medium". Maps 1:1 to the rendered Icon's own `size` prop
   * — no indirection map like Button's, since there's no text label
   * competing for space here. */
  size?: IconButtonSize;
  /** Defaults to "intense". See decisions/decision-iconbutton-reuses-existing-tokens.md
   * for how each emphasis level maps onto this project's existing tokens. */
  emphasis?: IconButtonEmphasis;
  /** Defaults to false. Background/fixed-square container presence is
   * gated by `isHighlighted || emphasis === "moderate"` ONLY — plain
   * subtle/intense (isHighlighted false) are always fully transparent, at
   * every state, matching Blade's real confirmed behavior. */
  isHighlighted?: boolean;
  /** REQUIRED, always — IconButton has no text-label alternative, unlike
   * Button's discriminated union. Maps to aria-label, not VisuallyHidden,
   * matching the precedent already established for icon-only Buttons. */
  accessibilityLabel: string;
  isDisabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

// small/medium container sizes only (24px/32px, matching Blade's real
// highlightedButtonSizeMap exactly) — deliberately no "large" entry, backing
// the size==="large" dev guard below rather than duplicating it.
const CONTAINER_ELIGIBLE_SIZES: readonly IconButtonSize[] = ["small", "medium"];

function warnIfLargeWithContainer(size: IconButtonSize, wantsContainer: boolean): void {
  if (process.env.NODE_ENV === "production") return;
  if (size === "large" && wantsContainer) {
    console.warn(
      '@farmsapp/design-system: IconButton received size="large" together with isHighlighted or ' +
        'emphasis="moderate" — there is no large container size, so it renders without a container instead. ' +
        "Blade's own real IconButton throws for this combination; this project warns and degrades instead, " +
        "matching every other dev-mode guard in this codebase.",
    );
  }
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon: Icon,
    size = "medium",
    emphasis = "intense",
    isHighlighted = false,
    accessibilityLabel,
    isDisabled = false,
    onClick,
    className,
    ...marginProps
  },
  ref,
) {
  const wantsContainer = isHighlighted || emphasis === "moderate";
  if (process.env.NODE_ENV !== "production") warnIfLargeWithContainer(size, wantsContainer);
  const hasContainer = wantsContainer && CONTAINER_ELIGIBLE_SIZES.includes(size);

  const classes = [
    "ds-icon-button",
    `ds-icon-button--emphasis-${emphasis}`,
    hasContainer && "ds-icon-button--has-container",
    hasContainer && `ds-icon-button--size-${size}`,
    isHighlighted && "ds-icon-button--highlighted",
    ...resolveBoxClassNames(marginProps),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      aria-label={accessibilityLabel}
      onClick={onClick}
      className={classes}
    >
      <Icon size={size} />
    </button>
  );
});
