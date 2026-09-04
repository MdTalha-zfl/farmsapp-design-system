import type { ComponentType, MouseEvent, ReactNode } from "react";
import { CompositeItem } from "@floating-ui/react";
import type { IconOwnProps } from "@farmsapp/icons";
import { useTabsContext } from "./TabsContext";

export type TabItemIconComponent = ComponentType<IconOwnProps>;

type TabItemCommonProps = {
  value: string;
  trailing?: ReactNode;
  isDisabled?: boolean;
  href?: string;
  onClick?: (event: MouseEvent) => void;
};

type TabItemWithoutLeadingProps = TabItemCommonProps & {
  children: ReactNode;
  leading?: undefined;
};

type TabItemWithoutChildrenProps = TabItemCommonProps & {
  leading: TabItemIconComponent;
  children?: ReactNode;
};

export type TabItemProps = TabItemWithoutLeadingProps | TabItemWithoutChildrenProps;

export function TabItem({ value, leading: Leading, trailing, children, isDisabled = false, href, onClick }: TabItemProps) {
  const { baseId, selectedValue, setSelectedValue, size, isFullWidthTabItem } = useTabsContext();
  const isSelected = selectedValue === value;
  const tabItemId = `${baseId}-${value}-tabitem`;
  const tabPanelId = `${baseId}-${value}-tabpanel`;

  function handleClick(event: MouseEvent) {
    if (isDisabled) return;
    setSelectedValue(value);
    onClick?.(event);
  }

  const classes = [
    "ds-tabs__item",
    `ds-tabs__item--size-${size}`,
    isSelected && "ds-tabs__item--selected",
    isFullWidthTabItem && "ds-tabs__item--full-width",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {Leading ? <Leading size={size === "large" ? "medium" : "small"} /> : null}
      {children ? <span className="ds-tabs__item-label">{children}</span> : null}
      {trailing}
    </>
  );

  const sharedProps = {
    id: tabItemId,
    className: classes,
    "aria-selected": isSelected,
    "aria-controls": tabPanelId,
    role: "tab" as const,
    onClick: handleClick,
  };

  if (href && !isDisabled) {
    return (
      <CompositeItem
        render={<a href={href} {...sharedProps}>{content}</a>}
      />
    );
  }

  return (
    <CompositeItem
      render={
        <button type="button" disabled={isDisabled} {...sharedProps}>
          {content}
        </button>
      }
    />
  );
}
