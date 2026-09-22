import type { MouseEvent, ReactNode } from "react";
import { Text } from "../Text/Text";

// Pressing on the non-interactive parts of the header or footer must not move
// focus off the trigger (a select) or out of the panel (a menu, where losing
// focus closes it). preventDefault on mousedown stops the focus change but
// not the click, so buttons in a footer still work.
const keepFocus = (event: MouseEvent<HTMLElement>) => event.preventDefault();

export interface DropdownHeaderProps {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  titleSuffix?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

/** Pinned above the scrolling list, inside the panel. */
export function DropdownHeader({ title, subtitle, leading, titleSuffix, trailing, children }: DropdownHeaderProps) {
  return (
    <div className="ds-dropdown__header" onMouseDown={keepFocus}>
      <div className="ds-dropdown__header-row">
        {leading}
        <div className="ds-dropdown__header-text">
          {title ? (
            <Text as="span" variant="body" weight="semibold">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text as="span" variant="caption" color="secondary">
              {subtitle}
            </Text>
          ) : null}
        </div>
        {titleSuffix}
        {trailing}
      </div>
      {children}
    </div>
  );
}

export interface DropdownFooterProps {
  children: ReactNode;
}

/** Pinned below the scrolling list, inside the panel. Its buttons sit outside
 * the list element, so they are not part of the listbox/menu. */
export function DropdownFooter({ children }: DropdownFooterProps) {
  return (
    <div className="ds-dropdown__footer" onMouseDown={keepFocus}>
      {children}
    </div>
  );
}
