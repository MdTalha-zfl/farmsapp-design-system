import { isValidElement, type ReactElement } from "react";
import type { ButtonIconComponent } from "../Button/BaseButton";

export interface SideNavItemProps {
  /** An icon component, or any element (e.g. a status dot). */
  leading: ButtonIconComponent | ReactElement;
  /** A Switch, a Button — whatever this row is for. */
  trailing: ReactElement;
  title: string;
  /** Defaults to "div". Use "label" only when `trailing` is a bare form
   * control that has no label of its own, so clicking the row toggles it. */
  as?: "div" | "label";
  /** Any CSS color, including a `var(--ds-color-...)` token. */
  backgroundColor?: string;
}

/**
 * A non-navigating row — a settings toggle, a status line — as opposed to
 * SideNavLink, which navigates or acts. On the collapsed rail only
 * `leading` shows.
 */
export function SideNavItem({ leading, trailing, title, as: Component = "div", backgroundColor }: SideNavItemProps) {
  // Icon components are forwardRef objects, not functions, so tell the two
  // apart by checking for an element instead.
  let leadingNode: ReactElement;
  if (isValidElement(leading)) {
    leadingNode = leading;
  } else {
    const Leading = leading as ButtonIconComponent;
    leadingNode = <Leading size="medium" color="secondary" />;
  }
  return (
    <Component className="ds-side-nav__item-row" style={backgroundColor ? { backgroundColor } : undefined}>
      {leadingNode}
      <span className="ds-side-nav__item-row-title">{title}</span>
      <span className="ds-side-nav__item-row-trailing">{trailing}</span>
    </Component>
  );
}
