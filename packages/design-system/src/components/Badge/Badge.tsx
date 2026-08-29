import type { ComponentType, ReactElement } from "react";
import type { IconOwnProps } from "@farmsapp/icons";
import { Text } from "../Text/Text";
import { resolveBoxClassNames, type MarginProps } from "../Box/Box";
import { badgeSizeToTextSizeMap } from "./badgeTokens";

/**
 * Badge — small, color-coded metadata for status/state ("Paid", "Overdue",
 * "Draft"). Traced directly against Blade's real Badge (single file, no
 * BaseBadge split, unlike Button/IconButton) — see
 * decisions/decision-badge-color-prop-scope-v1.md,
 * decisions/decision-badge-emphasis-reuses-existing-tokens.md,
 * decisions/decision-badge-size-scale-drops-xsmall.md,
 * decisions/decision-badge-warn-not-throw-empty-children.md, and
 * decisions/decision-badge-shape-prop.md for the real divergences from
 * Blade's own implementation (which has no shape axis at all).
 */

export type BadgeColor = "success" | "warning" | "danger";
export type BadgeEmphasis = "subtle" | "intense";
export type BadgeSize = "small" | "medium" | "large";
export type BadgeShape = "rounded" | "square";

// Reuses Button's own "icon component shape" convention (ButtonIconComponent)
// rather than importing it — Badge has no dependency on Button, and this is
// a 1-line type, not worth a cross-component import for.
export type BadgeIconComponent = ComponentType<IconOwnProps>;

export interface BadgeOwnProps extends MarginProps {
  color: BadgeColor;
  /** Defaults to "subtle". */
  emphasis?: BadgeEmphasis;
  /** Defaults to "medium". */
  size?: BadgeSize;
  /** Defaults to "square" (`radius.sm`) — "rounded" (`radius.full`, a pill)
   * matches Blade's own fixed shape, which has no shape axis at all. See
   * decisions/decision-badge-shape-prop.md. */
  shape?: BadgeShape;
  icon?: BadgeIconComponent;
  /** Required — Badge has no icon-only mode (no accessible-name mechanism
   * exists on Badge the way it does on Button/IconButton), matching Blade's
   * own resolved "text as children is required" rule. */
  children: string;
  className?: string;
}

function warnIfEmptyChildren(children: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (!children || children.trim().length === 0) {
    console.warn(
      "@farmsapp/design-system: Badge received empty/whitespace-only children — " +
        "Badge always requires visible text, there is no icon-only Badge. Rendering an empty badge.",
    );
  }
}

export function Badge({
  color,
  emphasis = "subtle",
  size = "medium",
  shape = "square",
  icon: Icon,
  children,
  className,
  ...marginProps
}: BadgeOwnProps): ReactElement {
  if (process.env.NODE_ENV !== "production") warnIfEmptyChildren(children);
  const hasText = Boolean(children) && children.trim().length > 0;

  const classes = [
    "ds-badge",
    `ds-badge--color-${color}`,
    `ds-badge--emphasis-${emphasis}`,
    `ds-badge--size-${size}`,
    `ds-badge--shape-${shape}`,
    ...resolveBoxClassNames(marginProps),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {hasText ? (
        <>
          {Icon ? <Icon size="small" /> : null}
          <Text
            as="span"
            variant="body"
            size={badgeSizeToTextSizeMap[size]}
            weight={emphasis === "intense" ? "regular" : "medium"}
            truncateAfterLines={1}
            padding="0"
          >
            {children}
          </Text>
        </>
      ) : null}
    </span>
  );
}
