import { StarIcon } from "@farmsapp/icons";
import type { IconSize } from "@farmsapp/icons";
import type { InputSize } from "../Input/types";

// Same InputSize -> icon-size mapping CartQuantityStepper uses for its +/- icons.
const ICON_SIZE_BY_SIZE: Record<InputSize, IconSize> = {
  xsmall: "small",
  small: "small",
  medium: "medium",
  large: "large",
};

export type RatingColor = "primary" | "warning" | "success" | "danger";

export interface RatingProps {
  /** 0–`max`, fractional values allowed (e.g. 4.3). Not clamped — pass a
   * value already within range. */
  value: number;
  /** Defaults to 5. */
  max?: number;
  /** Defaults to "medium". */
  size?: InputSize;
  /** Fill color for the star icons. Defaults to "primary" (this design
   * system's brand color, not the conventional gold/amber star-rating
   * hue) — pass "warning" for that familiar gold look, or "success"/
   * "danger" to match a feedback state elsewhere on the same screen. */
  color?: RatingColor;
  /** Overrides the generated "Rated X out of Y" aria-label, e.g. to fold in
   * a review count ("4.3 out of 5, 128 reviews"). */
  accessibilityLabel?: string;
  className?: string;
}

/**
 * Read-only star display for showing a score — a product card's average
 * rating, a review's star line. Renders one static element with a single
 * aria-label rather than per-star roles: there is nothing here for a
 * screen-reader user to interact with, so radio/slider semantics from the
 * APG rating pattern don't apply. See
 * decisions/decision-rating-display-vs-input-split.md. For letting a user
 * pick a rating (e.g. writing a review), a separate interactive mode is
 * planned, not this component's read-only path.
 */
export function Rating({
  value,
  max = 5,
  size = "medium",
  color = "primary",
  accessibilityLabel,
  className,
}: RatingProps) {
  const iconSize = ICON_SIZE_BY_SIZE[size];
  const label = accessibilityLabel ?? `Rated ${value} out of ${max}`;

  const rootClasses = ["ds-rating", `ds-rating--color-${color}`, className].filter(Boolean).join(" ");

  return (
    <span className={rootClasses} role="img" aria-label={label}>
      {Array.from({ length: max }, (_, index) => {
        // Fraction of this star that should read as filled: 1 for a star
        // fully below `value`, 0 for one fully above it, and the leftover
        // fraction for the single star straddling a non-integer value.
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className="ds-rating__star" aria-hidden="true">
            <StarIcon size={iconSize} className="ds-rating__star-track" />
            <span className="ds-rating__star-fill" style={{ width: `${fill * 100}%` }}>
              <StarIcon size={iconSize} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
