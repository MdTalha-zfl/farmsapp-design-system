import type { ReactNode } from "react";

export interface ActionListSectionProps {
  title: string;
  /** ActionListItem elements. */
  children: ReactNode;
}

/**
 * A titled group inside an ActionList. It is a `role="group"` named by its
 * title (the visible title is hidden from assistive tech so it isn't read
 * twice). Items inside still register in DOM order, so keyboard navigation
 * runs straight through sections. The divider below a section is a CSS
 * pseudo-element, hidden on the last one.
 */
export function ActionListSection({ title, children }: ActionListSectionProps) {
  return (
    <div role="group" aria-label={title} className="ds-action-list__section">
      <p aria-hidden="true" className="ds-action-list__section-title">
        {title}
      </p>
      {children}
    </div>
  );
}
