import {
  forwardRef,
  useContext,
  type ElementType,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useFloatingTree, useListItem, useMergeRefs } from "@floating-ui/react";
import { ChevronRightIcon } from "@farmsapp/icons";
import { MenuContext, MenuTriggerContext } from "./MenuContext";

export interface MenuItemProps {
  title?: string;
  description?: string;
  /** Replaces the whole item body, for custom content. */
  children?: ReactNode;
  /** The element to render: `"a"` when there is an `href`, otherwise
   * `"button"`. Pass a router's link component here; every prop you give
   * MenuItem that it does not use itself (such as `to`) is passed through. */
  as?: ElementType;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  href?: string;
  /** Applied to the link (Blade's MenuItem accepts this and silently drops it). */
  target?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Non-interactive content after the title, e.g. a Badge. */
  titleSuffix?: ReactElement;
  isDisabled?: boolean;
  /** Red styling for destructive actions such as Delete or Log out. */
  color?: "negative";
}

/**
 * One action. Clicking it runs `onClick` and then closes the whole menu (every
 * open level), whether or not it has an `onClick` — a MenuItem that only holds
 * custom content should not be one. As the first child of a nested `Menu` it
 * becomes that submenu's trigger, with a right chevron.
 */
export const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(props, forwardedRef) {
  const {
    title,
    description,
    children,
    as,
    onClick,
    onFocus,
    href,
    target,
    leading,
    trailing,
    titleSuffix,
    isDisabled = false,
    color,
    // Everything else is passed to the element: a submenu trigger arrives
    // carrying its interaction props (aria-*, key/pointer handlers), and a
    // custom `as` (a router link) brings its own (e.g. `to`).
    ...rest
  } = props;

  // For a submenu trigger this is the PARENT menu: the trigger is rendered
  // outside the submenu's own provider, because it is an item of the parent.
  const menu = useContext(MenuContext);
  const isSubmenuTrigger = useContext(MenuTriggerContext);
  const tree = useFloatingTree();

  // A disabled item passes no label, which keeps it out of typeahead; it also
  // is disabled (or aria-disabled), so arrow keys skip it.
  const item = useListItem({ label: isDisabled ? null : (title ?? null) });
  const ref = useMergeRefs([item.ref, forwardedRef]);
  const isActive = item.index !== -1 && menu?.activeIndex === item.index;

  const isLink = href !== undefined && !isDisabled;
  const Element: ElementType = as ?? (isLink ? "a" : "button");
  const isNativeButton = Element === "button";

  const className = [
    "ds-action-list__item",
    "ds-menu__item",
    color === "negative" && "ds-action-list__item--negative",
    isSubmenuTrigger && "ds-menu__item--submenu-trigger",
  ]
    .filter(Boolean)
    .join(" ");

  const itemProps = {
    ...rest,
    onClick(event: MouseEvent<HTMLElement>) {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      // Picking an action closes every open level. A submenu's trigger opens
      // its menu instead.
      if (!isSubmenuTrigger) tree?.events.emit("click");
    },
    onFocus(event: FocusEvent<HTMLElement>) {
      onFocus?.(event);
    },
  };

  return (
    <Element
      // A disabled link has no destination and is not clickable.
      {...(isLink ? { href, ...(target ? { target } : {}), ...(target === "_blank" ? { rel: "noopener noreferrer" } : {}) } : {})}
      {...(isNativeButton ? { type: "button", disabled: isDisabled } : {})}
      {...(isDisabled ? { "aria-disabled": true } : {})}
      {...(menu ? menu.getItemProps(itemProps) : itemProps)}
      ref={ref}
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      className={className}
    >
      {children ?? (
        <>
          {leading ? <span className="ds-action-list__leading">{leading}</span> : null}
          <span className="ds-action-list__text">
            {title ? <span className="ds-action-list__title">{title}</span> : null}
            {description ? <span className="ds-action-list__description">{description}</span> : null}
          </span>
          {titleSuffix}
          {trailing ? <span className="ds-action-list__trailing">{trailing}</span> : null}
          {isSubmenuTrigger ? (
            <span className="ds-action-list__trailing">
              <ChevronRightIcon size="medium" color="secondary" />
            </span>
          ) : null}
        </>
      )}
    </Element>
  );
});
