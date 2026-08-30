import type { CSSProperties, ReactElement } from "react";
import type { TestID } from "../../utils/types";
import { resolveBoxClassNames, type MarginProps } from "../Box/Box";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerStyle = "solid" | "dashed";
export type DividerVariant = "normal" | "subtle" | "muted";
export type DividerThickness = "thinner" | "thin" | "thick" | "thicker";

export interface DividerOwnProps extends TestID, MarginProps {
  /** @default 'horizontal' */
  orientation?: DividerOrientation;
  /** @default 'solid' */
  dividerStyle?: DividerStyle;
  /** @default 'normal' */
  variant?: DividerVariant;
  /** @default 'thin' */
  thickness?: DividerThickness;
  /**
   * Sets the height of divider. Divider uses Flex by default, use height only when parent is not flex.
   */
  height?: CSSProperties["height"];
  /**
   * Sets the width of divider. Divider uses Flex by default, use width only when parent is not flex.
   */
  width?: CSSProperties["width"];
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  dividerStyle = "solid",
  variant = "normal",
  thickness = "thin",
  height,
  width,
  testID,
  className,
  ...marginProps
}: DividerOwnProps): ReactElement {
  const classes = [
    "ds-divider",
    `ds-divider--orientation-${orientation}`,
    `ds-divider--style-${dividerStyle}`,
    `ds-divider--variant-${variant}`,
    `ds-divider--thickness-${thickness}`,
    ...resolveBoxClassNames(marginProps),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={height !== undefined || width !== undefined ? { height, width } : undefined}
      role="separator"
      aria-orientation={orientation}
      data-testid={testID}
    />
  );
}
