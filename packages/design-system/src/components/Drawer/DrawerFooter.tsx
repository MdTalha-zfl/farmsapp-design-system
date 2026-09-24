import type { ReactNode } from "react";
import { Divider } from "../Divider/Divider";

export interface DrawerFooterProps {
  children: ReactNode;
  /** Defaults to true. */
  showDivider?: boolean;
}

export function DrawerFooter({ children, showDivider = true }: DrawerFooterProps) {
  return (
    <div className="ds-drawer__footer">
      {showDivider ? <Divider /> : null}
      <div className="ds-drawer__footer-content">{children}</div>
    </div>
  );
}
