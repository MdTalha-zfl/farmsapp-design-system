import type { ComponentType, ElementType, MouseEvent } from "react";
import type { IconOwnProps } from "@farmsapp/icons";

export type BottomNavItemProps = {
  title: string;
  icon: ComponentType<IconOwnProps>;
  /** Controlled by the caller's router/state — BottomNav keeps no selection state. */
  isActive?: boolean;
  href?: string;
  /** Polymorphic link component, e.g. react-router's NavLink. Needs href. */
  as?: ElementType;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent) => void;
};

export function BottomNavItem({
  title,
  icon: Icon,
  isActive = false,
  href,
  as: Component,
  target,
  rel,
  onClick,
}: BottomNavItemProps) {
  const className = ["ds-bottom-nav__item", isActive && "ds-bottom-nav__item--active"].filter(Boolean).join(" ");
  const content = (
    <>
      <span className="ds-bottom-nav__icon">
        <Icon size="medium" />
      </span>
      <span className="ds-bottom-nav__label">{title}</span>
    </>
  );
  const ariaCurrent = isActive ? ("page" as const) : undefined;

  if (href) {
    const Link = Component ?? "a";
    const safeRel = rel ?? (target === "_blank" ? "noreferrer noopener" : undefined);
    const linkProps = Component ? { to: href } : { href };
    return (
      <Link {...linkProps} className={className} aria-current={ariaCurrent} target={target} rel={safeRel} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} aria-current={ariaCurrent} onClick={onClick}>
      {content}
    </button>
  );
}
