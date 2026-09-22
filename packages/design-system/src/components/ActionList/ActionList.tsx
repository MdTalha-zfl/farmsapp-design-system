import { useLayoutEffect, useRef, type ReactNode } from "react";
import { FloatingList } from "@floating-ui/react";
import { useDropdownContext } from "../Dropdown/DropdownContext";
import { useDropdownSheetGlue } from "../Dropdown/DropdownSheetGlue";

export interface ActionListProps {
  /** ActionListItem elements. Fragments, wrapper components and conditional
   * items are all fine: items register themselves, nothing scans children
   * (Blade's ActionList throws on a fragment in dev and silently ignores it
   * in production). */
  children: ReactNode;
}

/** The list of options. It carries the menu semantics (`role`, `id`, the
 * key handlers that drive navigation), and provides the registry every
 * ActionListItem below it registers into. */
export function ActionList({ children }: ActionListProps) {
  const { listRef, labelsRef, getFloatingProps, trigger, isSheet } = useDropdownContext();
  const glue = useDropdownSheetGlue();
  const isEmpty = trigger?.filteredValues?.length === 0;

  // In a sheet, focus has to be handed to the list when the sheet opens: the
  // chosen option, else the first enabled one. The sheet's focus manager reads
  // this ref at that moment. Kept current from the DOM (not listRef, which
  // fills a commit later) each time the selection changes.
  const listElementRef = useRef<HTMLDivElement>(null);
  const selectionKey = trigger?.values.join("");
  useLayoutEffect(() => {
    if (!isSheet || !glue) return;
    const list = listElementRef.current;
    glue.initialFocusRef.current =
      list?.querySelector<HTMLElement>('[data-value][aria-selected="true"]') ??
      list?.querySelector<HTMLElement>('[data-value]:not([aria-disabled="true"]):not(:disabled)') ??
      null;
  }, [isSheet, glue, selectionKey]);
  return (
    <FloatingList elementsRef={listRef} labelsRef={labelsRef}>
      <div
        ref={listElementRef}
        className="ds-action-list"
        {...getFloatingProps()}
        aria-multiselectable={trigger?.isMultiple ? true : undefined}
        hidden={isEmpty}
      >
        {children}
      </div>
      {isEmpty ? <div className="ds-action-list__empty">{trigger?.emptyMessage}</div> : null}
    </FloatingList>
  );
}
