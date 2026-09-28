import type { ReactNode } from "react";
import { ChevronDownIcon } from "@farmsapp/icons";
import { Text } from "../Text/Text";
import { useCollapsibleContext } from "./CollapsibleContext";

export interface CollapsibleTriggerProps {
  title?: string;
  /** Placed at the far left, e.g. an amount or an icon. */
  leading?: ReactNode;
  /** Placed before the chevron, outside the toggle button — safe to hold
   * its own interactive element (a Button, a Link) without nesting
   * interactive content inside a button. */
  trailing?: ReactNode;
  /** Custom trigger content — replaces `title`. */
  children?: ReactNode;
}

/**
 * `button` with `aria-expanded`/`aria-controls`, matching the accordion
 * trigger pattern. The button's `::after` is stretched over the whole row
 * (collapsible.css), so the full row is still clickable even though
 * `trailing` sits beside the button, not inside it.
 */
export function CollapsibleTrigger({ title, leading, trailing, children }: CollapsibleTriggerProps) {
  const { isOpen, isDisabled, triggerId, panelId, toggle } = useCollapsibleContext();

  return (
    <div className="ds-collapsible__header">
      <button
        type="button"
        id={triggerId}
        className="ds-collapsible__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={isDisabled}
        onClick={toggle}
      >
        {leading ? <span className="ds-collapsible__leading">{leading}</span> : null}
        {children ?? (
          <Text as="span" variant="body" size="medium" weight="semibold" className="ds-collapsible__title">
            {title}
          </Text>
        )}
      </button>
      {trailing ? <div className="ds-collapsible__trailing">{trailing}</div> : null}
      <ChevronDownIcon size="medium" className="ds-collapsible__chevron" aria-hidden="true" />
    </div>
  );
}
