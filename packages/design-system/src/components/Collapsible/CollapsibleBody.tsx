import type { ReactNode } from "react";
import { useCollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleBodyProps {
  children?: ReactNode;
}

/**
 * Two nested wrappers are deliberate (same technique as Accordion's panel):
 * the outer grid animates its row from 0fr to 1fr, the inner `clip`
 * (min-height: 0; overflow: hidden) is what lets that row actually shrink
 * below its content. Collapsed content is `visibility: hidden` (after the
 * transition), so it's out of the tab order and the accessibility tree
 * without needing `inert`.
 */
export function CollapsibleBody({ children }: CollapsibleBodyProps) {
  const { isOpen, triggerId, panelId } = useCollapsibleContext();

  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      className={`ds-collapsible__panel${isOpen ? " ds-collapsible__panel--open" : ""}`}
    >
      <div className="ds-collapsible__panel-clip">
        <div className="ds-collapsible__body">{children}</div>
      </div>
    </div>
  );
}
