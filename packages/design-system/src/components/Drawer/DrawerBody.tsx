import type { ReactNode } from "react";

export interface DrawerBodyProps {
  children: ReactNode;
}

/** The only region that scrolls. Its padding is `--ds-drawer-padding`, a CSS
 * custom property defined on the drawer panel, so content inside (e.g. a
 * footer that needs to pull itself to the drawer's edges) can read the same
 * value instead of a hard-coded copy. */
export function DrawerBody({ children }: DrawerBodyProps) {
  return <div className="ds-drawer__body">{children}</div>;
}
