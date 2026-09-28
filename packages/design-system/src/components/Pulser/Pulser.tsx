export type PulserIntensity = "subtle" | "medium" | "strong";

export interface PulserProps {
  /** Content to pulse — the button, badge, card, etc. Pulser only wraps
   * it in a span and toggles a class; it never clones or restyles the
   * child. */
  children: React.ReactNode;
  /** Whether the pulse is running — a double zoom-in/zoom-out pulse
   * followed by a hold, looping for as long as this stays `true`. The
   * ambient "look here" cue for an idle CTA or an unread badge. Flip
   * back to `false` to stop it. */
  pulse?: boolean;
  intensity?: PulserIntensity;
  as?: React.ElementType;
  className?: string;
}

/**
 * Wraps any element in a double zoom-in/zoom-out pulse (with a hold
 * between cycles) to draw the eye — an idle CTA, a badge that just
 * gained a count, a price that just dropped. Purely a visual nudge: it
 * never intercepts clicks or changes the child's layout box (animates
 * `transform`, so it doesn't reflow surrounding content).
 */
export function Pulser({
  children,
  pulse = false,
  intensity = "medium",
  as: Tag = "span",
  className,
}: PulserProps) {
  const rootClasses = [
    "ds-pulser",
    pulse && "ds-pulser--active",
    pulse && `ds-pulser--intensity-${intensity}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={rootClasses}>{children}</Tag>;
}
