import type { ReactNode } from "react";
import { XIcon } from "@farmsapp/icons";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";
import { useModalContext } from "./ModalContext";

export interface ModalHeaderProps {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  /** Convention, not enforced by the type system: Button/IconButton/Badge/
   * Link/Text, matching Blade's own restriction (documented there, not
   * type-enforced there either). */
  trailing?: ReactNode;
}

/**
 * Owns the default close button and registers it as the default
 * initial-focus target via ModalContext — same role Popover's internal
 * close-button rendering plays, but here it's a real subcomponent since
 * Modal's header is optional (a body-only modal renders no ModalHeader at
 * all, needing its own external floating close button instead — see
 * ModalBody's own comment).
 */
export function ModalHeader({ title, subtitle, leading, trailing }: ModalHeaderProps) {
  const { close, isDismissible, defaultInitialFocusRef } = useModalContext();

  return (
    <div className="ds-modal__header">
      {leading}
      <div className="ds-modal__header-text">
        {title ? (
          <Text as="span" variant="body" weight="semibold" size="large" className="ds-modal__title">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text as="span" variant="body" color="secondary" className="ds-modal__subtitle">
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
          className="ds-modal__close"
        />
      ) : null}
    </div>
  );
}
