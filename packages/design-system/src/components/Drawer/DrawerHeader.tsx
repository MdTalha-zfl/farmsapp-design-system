import type { ReactNode } from "react";
import { ChevronLeftIcon, XIcon } from "@farmsapp/icons";
import { Divider } from "../Divider/Divider";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";
import { useDrawerContext } from "./DrawerContext";

export interface DrawerHeaderProps {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  titleSuffix?: ReactNode;
  trailing?: ReactNode;
  /** Extra header content below the title row. */
  children?: ReactNode;
  /** Defaults to true. */
  showDivider?: boolean;
}

/**
 * Owns the close button and registers it as the default initial-focus
 * target. When drawers are stacked, a back button (this drawer only) appears
 * beside the title, and the close button closes every drawer.
 */
export function DrawerHeader({
  title,
  subtitle,
  leading,
  titleSuffix,
  trailing,
  children,
  showDivider = true,
}: DrawerHeaderProps) {
  const { close, closeAll, isDismissible, defaultInitialFocusRef, titleId, level } = useDrawerContext();

  return (
    <div className="ds-drawer__header-wrap">
      <div className="ds-drawer__header">
        <div className="ds-drawer__header-row">
          {isDismissible && level > 1 ? (
            <IconButton
              icon={ChevronLeftIcon}
              size="small"
              emphasis="subtle"
              accessibilityLabel="Back"
              onClick={close}
            />
          ) : null}
          {leading}
          <div className="ds-drawer__header-text">
            {title ? (
              <Text as="span" id={titleId} variant="body" weight="semibold" size="large">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text as="span" variant="body" color="secondary">
                {subtitle}
              </Text>
            ) : null}
          </div>
          {titleSuffix}
          {trailing}
          {isDismissible ? (
            <IconButton
              ref={defaultInitialFocusRef}
              icon={XIcon}
              size="small"
              emphasis="subtle"
              accessibilityLabel="Close"
              onClick={closeAll}
              className="ds-drawer__close"
            />
          ) : null}
        </div>
        {children ? <div className="ds-drawer__header-extra">{children}</div> : null}
      </div>
      {showDivider ? <Divider /> : null}
    </div>
  );
}
