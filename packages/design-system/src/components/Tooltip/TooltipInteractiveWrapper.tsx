import { forwardRef, type ReactNode } from "react";

/**
 * A minimal wrapper for a Tooltip trigger that has no built-in interactive
 * semantics of its own (a plain Icon, e.g.) — Tooltip clones its `children`
 * directly (React.cloneElement, matching Blade's real mechanism), which
 * needs a real DOM node to attach a ref/event handlers to. Matches Blade's
 * own real, documented reasoning for why this is a separate opt-in
 * component rather than Tooltip auto-wrapping every trigger in a `<div>`:
 * refs would need exposing on every icon component, an auto-wrap-detection
 * approach risks a hydration mismatch/flicker, and a "should I wrap"
 * prop produces an uncontrollable extra element. Manual, explicit wrapping
 * is more predictable and customizable. See
 * decisions/decision-tooltip-adds-dismiss.md's sibling reasoning and the
 * Tooltip trace this was built from.
 *
 * `tabIndex={-1}`, not `0` — matches Blade's real code exactly. Focusable
 * programmatically (for floating-ui's own ref mechanics) but not part of
 * natural Tab order — hover is the primary channel for a non-interactive
 * trigger, keyboard-focus-shows-tooltip isn't the point here.
 */

export interface TooltipInteractiveWrapperProps {
  children: ReactNode;
  className?: string;
}

export const TooltipInteractiveWrapper = forwardRef<HTMLSpanElement, TooltipInteractiveWrapperProps>(
  function TooltipInteractiveWrapper({ children, className }, ref) {
    return (
      <span ref={ref} tabIndex={-1} className={["ds-tooltip-interactive-wrapper", className].filter(Boolean).join(" ")}>
        {children}
      </span>
    );
  },
);
