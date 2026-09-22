import type { ReactNode } from "react";

export interface BottomSheetBodyProps {
  children: ReactNode;
  padding?: "0" | "5";
}

/** The only region that scrolls. Deliberately has no drag handlers, so
 * native scrolling never competes with the sheet drag */
export function BottomSheetBody({ children, padding = "5" }: BottomSheetBodyProps) {
  return <div className={`ds-bottom-sheet__body ds-bottom-sheet__body--padding-${padding}`}>{children}</div>;
}
