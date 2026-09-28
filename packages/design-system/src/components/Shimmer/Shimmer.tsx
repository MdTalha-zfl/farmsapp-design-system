export type ShimmerSpeed = "slow" | "medium" | "fast";

export interface ShimmerProps {
  /** Content the shimmer sweeps over — a button, card, etc. Shimmer only
   * wraps it in a span and adds an overlay; it never clones or restyles
   * the child. */
  children: React.ReactNode;
  /** Whether the shimmer is running — a diagonal band of light sweeps
   * across the content, looping for as long as this stays `true`. The
   * ambient "look here" sheen for an idle CTA like "Add to cart" or
   * "Place order". Flip back to `false` to stop it. */
  shimmer?: boolean;
  speed?: ShimmerSpeed;
  as?: React.ElementType;
  className?: string;
}

/**
 * Wraps any element with a diagonal band of light that sweeps across it
 * to draw the eye — an idle "Add to cart" or "Place order" CTA. Purely a
 * visual overlay: the sweeping band is `pointer-events: none` and sits
 * above the content via a `::after` layer, so it never intercepts clicks
 * or changes the child's layout box.
 */
export function Shimmer({
  children,
  shimmer = false,
  speed = "medium",
  as: Tag = "span",
  className,
}: ShimmerProps) {
  const rootClasses = [
    "ds-shimmer",
    shimmer && "ds-shimmer--active",
    shimmer && `ds-shimmer--speed-${speed}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={rootClasses}>{children}</Tag>;
}
