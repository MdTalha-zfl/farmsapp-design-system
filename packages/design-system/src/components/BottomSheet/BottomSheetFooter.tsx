import type { ReactNode } from "react";
import { Divider } from "../Divider/Divider";
import { useBottomSheetContext } from "./BottomSheetContext";

export interface BottomSheetFooterProps {
  children: ReactNode;
}

export function BottomSheetFooter({ children }: BottomSheetFooterProps) {
  const { dragZoneProps } = useBottomSheetContext();
  return (
    <div className="ds-bottom-sheet__footer" {...dragZoneProps}>
      <Divider />
      <div className="ds-bottom-sheet__footer-content">{children}</div>
    </div>
  );
}
