import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export interface PopoverInteractiveWrapperProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const PopoverInteractiveWrapper = forwardRef<HTMLButtonElement, PopoverInteractiveWrapperProps>(
  function PopoverInteractiveWrapper({ children, className, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={["ds-popover-interactive-wrapper", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  },
);
