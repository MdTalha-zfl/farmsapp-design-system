import { cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref } from "react";
import { XIcon } from "@farmsapp/icons";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";

export interface PopoverContentProps {
  title?: string | undefined;
  titleLeading?: ReactNode;
  footer?: ReactNode;
  content: ReactElement;
  titleId: string;
  onClose: () => void;
  closeButtonRef: Ref<HTMLButtonElement>;
}

export function PopoverContent({ title, titleLeading, footer, content, titleId, onClose, closeButtonRef }: PopoverContentProps) {
  const hasHeader = Boolean(title || titleLeading);
  const closeButton = (
    <IconButton
      ref={closeButtonRef}
      icon={XIcon}
      size="small"
      emphasis="subtle"
      accessibilityLabel="Close"
      onClick={onClose}
      className="ds-popover__close"
    />
  );

  return (
    <>
      {hasHeader ? (
        <div className="ds-popover__header">
          {titleLeading && isValidElement(titleLeading)
            ? cloneElement(titleLeading as ReactElement<{ size?: string }>, { size: "medium" })
            : titleLeading}
          {title ? (
            <Text as="span" id={titleId} variant="body" weight="semibold" className="ds-popover__title">
              {title}
            </Text>
          ) : null}
          {closeButton}
        </div>
      ) : (
        <div className="ds-popover__close-floating">{closeButton}</div>
      )}
      <div className={hasHeader ? "ds-popover__body" : "ds-popover__body ds-popover__body--reserve-close"}>{content}</div>
      {footer ? <div className="ds-popover__footer">{footer}</div> : null}
    </>
  );
}
