import type { ReactNode } from "react";
import { Divider } from "../Divider/Divider";

export interface ModalFooterProps {
  children: ReactNode;
}

/** Always renders its top divider — matches Blade (`showDivider={true}`
 * hardcoded, never a prop). */
export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="ds-modal__footer">
      <Divider />
      <div className="ds-modal__footer-content">{children}</div>
    </div>
  );
}
