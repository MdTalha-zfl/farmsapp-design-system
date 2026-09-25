/** A rule between groups of items. It spans the overlay's full width (the
 * overlay's padding is cancelled with a negative margin), and is a
 * `separator`, which a `menu` may contain. */
export function MenuDivider() {
  return <div role="separator" className="ds-menu__divider" />;
}
