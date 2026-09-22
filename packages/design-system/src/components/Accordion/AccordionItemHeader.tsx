import type { ReactNode } from "react";
import { ChevronDownIcon } from "@farmsapp/icons";
import { Text } from "../Text/Text";
import { useAccordionContext, useAccordionItemContext } from "./AccordionContext";

export interface AccordionItemHeaderProps {
  title?: string;
  subtitle?: string;
  /** Placed at the far left, e.g. `<Icon />`. Can't be combined with
   * `showNumberPrefix` on the Accordion. */
  leading?: ReactNode;
  /** Placed before the chevron. Rendered *outside* the toggle button, so it
   * can safely hold its own interactive element (a Button, a Link) without
   * nesting interactive content inside a button. */
  trailing?: ReactNode;
  /** Placed next to the title, e.g. a Badge. */
  titleSuffix?: ReactNode;
  /** Custom header content — replaces title/subtitle/titleSuffix. */
  children?: ReactNode;
}

/**
 * Structure follows the WAI-ARIA accordion pattern: `h3 > button`, with the
 * button carrying `aria-expanded`/`aria-controls`. The button's `::after`
 * is stretched over the whole row (accordion.css), so the full header is
 * still clickable even though `trailing` sits beside the button, not in it.
 */
export function AccordionItemHeader({ title, subtitle, leading, trailing, titleSuffix, children }: AccordionItemHeaderProps) {
  const { size, showNumberPrefix } = useAccordionContext();
  const { index, isExpanded, isDisabled, triggerId, panelId, toggle } = useAccordionItemContext();

  const hasLeading = leading !== undefined && leading !== null && leading !== false;
  if (showNumberPrefix && hasLeading && process.env.NODE_ENV !== "production") {
    console.error(
      "@farmsapp/design-system: showNumberPrefix and a `leading` element can't be combined on one AccordionItemHeader. Rendering `leading` and skipping the number.",
    );
  }
  const showNumber = showNumberPrefix && !hasLeading;

  const titleSize = size === "large" ? "large" : "medium";
  const subtitleSize = size === "large" ? "medium" : "small";

  return (
    <div className="ds-accordion__header">
      <h3 className="ds-accordion__heading">
        <button
          type="button"
          id={triggerId}
          className="ds-accordion__trigger"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          disabled={isDisabled}
          onClick={toggle}
        >
          {showNumber ? (
            <Text as="span" variant="body" size={titleSize} weight="semibold" className="ds-accordion__number">
              {index + 1}.
            </Text>
          ) : null}
          {hasLeading ? <span className="ds-accordion__leading">{leading}</span> : null}
          {children ?? (
            <span className="ds-accordion__text">
              {title ? (
                <span className="ds-accordion__title-row">
                  <Text as="span" variant="body" size={titleSize} weight="semibold">
                    {title}
                  </Text>
                  {titleSuffix}
                </span>
              ) : null}
              {subtitle ? (
                <Text as="span" variant="body" size={subtitleSize} color="secondary">
                  {subtitle}
                </Text>
              ) : null}
            </span>
          )}
        </button>
      </h3>
      {trailing ? <div className="ds-accordion__trailing">{trailing}</div> : null}
      <ChevronDownIcon size="small" className="ds-accordion__chevron" aria-hidden="true" />
    </div>
  );
}
