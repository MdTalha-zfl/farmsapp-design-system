import type { ReactNode } from "react";
import { Text } from "../Text/Text";

export interface MenuHeaderProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  titleSuffix?: ReactNode;
  trailing?: ReactNode;
}

/** A title block at the top of the overlay, ruled off from the items below. */
export function MenuHeader({ title, subtitle, leading, titleSuffix, trailing }: MenuHeaderProps) {
  return (
    <div className="ds-menu__header">
      {leading}
      <div className="ds-menu__header-text">
        <Text as="span" variant="body" weight="semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text as="span" variant="caption" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {titleSuffix}
      {trailing}
    </div>
  );
}

export interface MenuFooterProps {
  children: ReactNode;
}

/** Content at the bottom of the overlay, ruled off from the items above. It is
 * not part of the menu's arrow-key list: reach a button in it with Tab. */
export function MenuFooter({ children }: MenuFooterProps) {
  return <div className="ds-menu__footer">{children}</div>;
}
