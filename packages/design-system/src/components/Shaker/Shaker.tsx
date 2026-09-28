export type ShakerIntensity = "subtle" | "medium" | "strong";

export interface ShakerProps {
  /** Content to shake — the button, cart item, card, etc. Shaker only
   * wraps it in a span and toggles a class; it never clones or restyles
   * the child. */
  children: React.ReactNode;
  /** Whether the shake is running — a slow, smooth, continuously looping
   * wiggle for as long as this stays `true`. The ambient "look here" cue
   * for an idle CTA or an unread cart. Flip back to `false` to stop it. */
  shake?: boolean;
  intensity?: ShakerIntensity;
  as?: React.ElementType;
  className?: string;
}

/**
 * Wraps any element in a slow, smooth, continuously looping wiggle to draw
 * the eye — an idle "Add to cart" CTA, a cart icon while something sits
 * unaddressed in it, a "Place order" button on a cart page. Purely a
 * visual nudge: it never intercepts clicks or changes the child's layout
 * box (animates `transform`, so it doesn't reflow surrounding content).
 */
export function Shaker({
  children,
  shake = false,
  intensity = "medium",
  as: Tag = "span",
  className,
}: ShakerProps) {
  const rootClasses = [
    "ds-shaker",
    shake && "ds-shaker--active",
    shake && `ds-shaker--intensity-${intensity}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={rootClasses}>{children}</Tag>;
}
