import type { ReactNode } from "react";

export interface ModalBodyProps {
  children: ReactNode;
  /** Defaults to "6". Only "0"/"6" allowed — matches Blade's own
   * deliberately restricted padding set. */
  padding?: "0" | "6";
  height?: string;
}

export function ModalBody({ children, padding = "6", height }: ModalBodyProps) {
  return (
    <div className={`ds-modal__body ds-modal__body--padding-${padding}`} style={height ? { height } : undefined}>
      {children}
    </div>
  );
}
