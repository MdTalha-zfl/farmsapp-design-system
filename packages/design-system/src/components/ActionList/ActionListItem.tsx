import { CheckIcon } from "@farmsapp/icons";
import { useLayoutEffect, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { useListItem } from "@floating-ui/react";
import type { ButtonIconComponent } from "../Button/BaseButton";
import { Badge, type BadgeOwnProps } from "../Badge/Badge";
import { Text } from "../Text/Text";
import { useDropdownContext } from "../Dropdown/DropdownContext";

export interface ActionListItemProps {
  title: string;
  /** What `onClick` reports and what a SelectInput's `value`/`onChange` use.
   * Must be unique within the list. */
  value: string;
  description?: string;
  /** ActionListItemIcon, or any non-interactive node. */
  leading?: ReactNode;
  /** ActionListItemText/ActionListItemIcon, or any non-interactive node. */
  trailing?: ReactNode;
  /** Non-interactive content after the title, e.g. an ActionListItemBadge. */
  titleSuffix?: ReactElement;
  isDisabled?: boolean;
  /** Red styling for destructive actions. */
  intent?: "negative";
  /** Fired when the item is chosen by click, Enter or Space; the list then
   * closes (a multiple select stays open). In a SelectInput the selection changes first. (Blade's payload
   * also carries a selected boolean; here a select reports through its own
   * `onChange`, and a menu has nothing to report.) */
  onClick?: (args: { name: string; event: MouseEvent<HTMLElement> }) => void;
}

export function ActionListItem({
  title,
  value,
  description,
  leading,
  trailing,
  titleSuffix,
  isDisabled = false,
  intent,
  onClick,
}: ActionListItemProps) {
  const { kind, trigger, getItemProps, activeIndex, setIsOpen, registerOption, isSheet } = useDropdownContext();
  const isSelect = kind === "select";
  // Registers this element in the list (in DOM order, so wrappers, fragments
  // and conditional items just work). A disabled item passes no label, which
  // keeps it out of typeahead; floating-ui skips it for arrow keys because it
  // is disabled (a disabled button, or aria-disabled).
  const { ref, index } = useListItem({ label: isDisabled ? null : title });
  const isActive = index !== -1 && activeIndex === index;
  const isSelected = isSelect && trigger?.values.includes(value) === true;
  const isMultiple = isSelect && trigger?.isMultiple === true;

  // Publish this item's title by value, so a select can show the chosen
  // item's title before the list has ever been opened.
  useLayoutEffect(() => registerOption(value, title), [registerOption, value, title]);

  // Filtered out (AutoComplete): stay registered — so a chosen tag keeps its
  // title — but render nothing, which also keeps it out of keyboard
  // navigation (an item that never mounts an element never joins the list).
  if (isSelect && trigger?.filteredValues && !trigger.filteredValues.includes(value)) return null;

  const className = [
    "ds-action-list__item",
    intent === "negative" && "ds-action-list__item--negative",
    isSelected && !isMultiple && "ds-action-list__item--selected",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {isMultiple ? (
        // Decorative: the option's aria-selected already says it.
        <span className="ds-action-list__checkbox" data-checked={isSelected || undefined} aria-hidden="true">
          <CheckIcon size="small" color="inverse" />
        </span>
      ) : null}
      {leading ? <span className="ds-action-list__leading">{leading}</span> : null}
      <span className="ds-action-list__text">
        <span className="ds-action-list__title">{title}</span>
        {description ? <span className="ds-action-list__description">{description}</span> : null}
      </span>
      {titleSuffix}
      {trailing ? <span className="ds-action-list__trailing">{trailing}</span> : null}
    </>
  );

  const activate = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) return;
    if (isSelect) trigger?.select(value);
    onClick?.({ name: value, event });
    // A multiple select stays open so several options can be picked.
    if (!isMultiple) setIsOpen(false);
  };

  if (isSelect) {
    // Virtual focus: the field keeps DOM focus, so an option is a plain
    // element (role/aria-selected/id come from getItemProps) and pressing on
    // it must not steal focus. In a sheet the options hold real focus instead
    // (roving tabindex), because the modal sheet has pulled focus off the field.
    return (
      <div
        ref={ref}
        data-value={value}
        data-active={isActive || undefined}
        aria-disabled={isDisabled || undefined}
        className={className}
        tabIndex={isSheet ? (isActive ? 0 : -1) : undefined}
        {...getItemProps({
          active: isActive,
          selected: isSelected,
          onClick: activate,
          ...(isSheet ? {} : { onMouseDown: (event: MouseEvent<HTMLElement>) => event.preventDefault() }),
        })}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      disabled={isDisabled}
      data-value={value}
      tabIndex={isActive ? 0 : -1}
      className={className}
      {...getItemProps({ onClick: activate })}
    >
      {content}
    </button>
  );
}

export function ActionListItemIcon({ icon: Icon }: { icon: ButtonIconComponent }) {
  return <Icon size="medium" />;
}

export function ActionListItemText({ children }: { children: string }) {
  return (
    <Text as="span" variant="caption" color="secondary" padding="0">
      {children}
    </Text>
  );
}

export function ActionListItemBadge(props: BadgeOwnProps) {
  return <Badge size="small" {...props} />;
}
