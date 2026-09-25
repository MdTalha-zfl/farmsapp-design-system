import { Children, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@farmsapp/icons";
import { useId } from "@farmsapp/utilities";

export interface SideNavSectionProps {
  /** Heading for the group; also names its list. On the collapsed rail it
   * is replaced by a divider. */
  title?: string;
  /** SideNavLink elements. A single child is fine. */
  children: ReactNode;
  /** Items past this many are collapsed behind a "+N More" toggle. */
  maxVisibleItems?: number;
  /** Whether the overflow starts expanded. Defaults to false. */
  defaultIsExpanded?: boolean;
  onExpandChange?: (args: { isExpanded: boolean }) => void;
}

export function SideNavSection({ title, children, maxVisibleItems, defaultIsExpanded = false, onExpandChange }: SideNavSectionProps) {
  const titleId = useId();
  const overflowId = useId();
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);

  const items = Children.toArray(children);
  const hasOverflow = maxVisibleItems !== undefined && maxVisibleItems < items.length;
  const hiddenItems = hasOverflow ? items.slice(maxVisibleItems) : [];
  const labelledBy = title ? titleId : undefined;

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    onExpandChange?.({ isExpanded: next });
  };

  return (
    <li className="ds-side-nav__section">
      {title ? (
        <>
          <p id={titleId} className="ds-side-nav__section-title">
            {title}
          </p>
          <span className="ds-side-nav__section-divider" aria-hidden="true" />
        </>
      ) : null}
      <ul role="list" aria-labelledby={labelledBy} className="ds-side-nav__list">
        {hasOverflow ? items.slice(0, maxVisibleItems) : items}
      </ul>
      {hasOverflow ? (
        <>
          <div className={["ds-side-nav__collapsible", isExpanded && "ds-side-nav__collapsible--open"].filter(Boolean).join(" ")}>
            <ul id={overflowId} role="list" aria-labelledby={labelledBy} className="ds-side-nav__list">
              {hiddenItems}
            </ul>
          </div>
          <button type="button" className="ds-side-nav__show-more" aria-expanded={isExpanded} aria-controls={overflowId} onClick={toggle}>
            <span className="ds-side-nav__show-more-label">{isExpanded ? "Show less" : `+${hiddenItems.length} More`}</span>
            {/* The rail has room for the count only. */}
            <span className="ds-side-nav__show-more-count" aria-hidden="true">
              {isExpanded ? "−" : `+${hiddenItems.length}`}
            </span>
            <ChevronDownIcon
              size="small"
              className={["ds-side-nav__chevron", isExpanded && "ds-side-nav__chevron--open"].filter(Boolean).join(" ")}
            />
          </button>
        </>
      ) : null}
    </li>
  );
}
