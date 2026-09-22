import type { ReactNode } from "react";
import { Text } from "../Text/Text";
import { useAccordionContext, useAccordionItemContext } from "./AccordionContext";

export interface AccordionItemBodyProps {
  /** A string/number is wrapped in `Text`; anything else renders as-is. */
  children?: ReactNode;
}

/**
 * Two nested wrappers are deliberate: the outer grid animates its row from
 * 0fr to 1fr, the inner `clip` (min-height: 0; overflow: hidden) is what
 * lets that row actually shrink below its content. Collapsed content is
 * `visibility: hidden` (after the transition), so it's out of the tab order
 * and the accessibility tree without needing `inert`.
 */
export function AccordionItemBody({ children }: AccordionItemBodyProps) {
  const { size } = useAccordionContext();
  const { isExpanded, triggerId, panelId } = useAccordionItemContext();

  const isPlainText = typeof children === "string" || typeof children === "number";

  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      className={`ds-accordion__panel${isExpanded ? " ds-accordion__panel--expanded" : ""}`}
    >
      <div className="ds-accordion__panel-clip">
        <div className="ds-accordion__body">
          {isPlainText ? (
            <Text as="p" variant="body" size={size === "large" ? "medium" : "small"} color="secondary">
              {children}
            </Text>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
