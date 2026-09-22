import type { ReactNode } from "react";
import { ChevronLeftIcon, XIcon } from "@farmsapp/icons";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";
import { useBottomSheetContext } from "./BottomSheetContext";

export interface BottomSheetHeaderProps {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
  children?: ReactNode;
}

export function isHeaderEmpty(props: BottomSheetHeaderProps): boolean {
  return !(props.title || props.subtitle || props.leading || props.trailing || props.showBackButton || props.children);
}

export function BottomSheetHeader(props: BottomSheetHeaderProps) {
  const { title, subtitle, leading, trailing, showBackButton = false, onBackButtonClick, children } = props;
  const { close, isDismissible, defaultInitialFocusRef, titleId, dragZoneProps } = useBottomSheetContext();

  if (isHeaderEmpty(props)) return null;

  return (
    <div className="ds-bottom-sheet__header" {...dragZoneProps}>
      <div className="ds-bottom-sheet__header-row">
        {showBackButton ? (
          <IconButton
            icon={ChevronLeftIcon}
            size="small"
            emphasis="subtle"
            accessibilityLabel="Back"
            {...(onBackButtonClick ? { onClick: () => onBackButtonClick() } : {})}
          />
        ) : null}
        {leading}
        <div className="ds-bottom-sheet__header-text">
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
        {trailing}
        {isDismissible ? (
          <IconButton
            ref={defaultInitialFocusRef}
            icon={XIcon}
            size="small"
            emphasis="subtle"
            accessibilityLabel="Close"
            onClick={close}
            className="ds-bottom-sheet__close"
          />
        ) : null}
      </div>
      {children ? <div className="ds-bottom-sheet__header-extra">{children}</div> : null}
    </div>
  );
}
