import type { CSSProperties } from "react";
import type { TextColor, TextWeight } from "../Box/resolveTypographyClasses";

export interface RollingDigitsProps {
  /** What to display — a number, or an already-formatted string
   * ("₹1,234.56", "01", "23:59"). Only 0-9 characters roll; everything else
   * (currency symbols, separators, punctuation) renders as static text
   * alongside them, unanimated. Locale/currency formatting is the caller's
   * job — pass the string already formatted. */
  value: number | string;
  /** One character's font-size — a literal length, a `var(--ds-font-size-*)`
   * token, or a `clamp()` expression for responsive sizing. Cell height and
   * line spacing derive from this automatically. Defaults to "1em" (inherits
   * the surrounding text's size). */
  fontSize?: string;
  /** Defaults to "semibold". */
  weight?: TextWeight;
  /** No default — an unset color falls through via ordinary CSS inheritance
   * from an ancestor, same reasoning as Text's own `color` prop. */
  color?: TextColor;
  /** Tabular/mono digits so a rolling character doesn't jitter in width as
   * it moves. Defaults to true; turn off only if a design calls for the
   * surrounding proportional font on the digits too. */
  monospace?: boolean;
  className?: string;
}

const DIGIT_STRIP = Array.from({ length: 10 }, (_, i) => i);

const WEIGHT_VAR: Record<TextWeight, string> = {
  regular: "var(--ds-font-weight-regular)",
  medium: "var(--ds-font-weight-medium)",
  semibold: "var(--ds-font-weight-semibold)",
};

const COLOR_VAR: Record<TextColor, string> = {
  primary: "var(--ds-color-text-primary)",
  secondary: "var(--ds-color-text-secondary)",
  disabled: "var(--ds-color-text-disabled)",
  inverse: "var(--ds-color-text-inverse)",
  danger: "var(--ds-color-text-danger)",
  warning: "var(--ds-color-text-warning)",
  success: "var(--ds-color-text-success)",
};

/** One character position: a ten-row 0-9 strip, clipped to one row's height,
 * shifted into place by the `--ds-rolling-digit` custom property. A CSS
 * `transition` on `transform` — not a remount — is what makes it roll
 * *through* the rows in between the old and new value. */
function RollingDigit({ digit }: { digit: number }) {
  return (
    <span className="ds-rolling-digits__track">
      <span className="ds-rolling-digits__strip" style={{ "--ds-rolling-digit": digit } as CSSProperties}>
        {DIGIT_STRIP.map((n) => (
          <span key={n} className="ds-rolling-digits__cell">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * A number that rolls to its new value one character at a time, odometer-
 * style, instead of snapping — a countdown timer's seconds, a cart quantity
 * stepping up, a price changing once a coupon is applied. Each character
 * position animates independently, so e.g. 11 -> 12 only rolls the ones
 * place; a 59 -> 00 rollover rolls every position because every position's
 * own digit changed, not because the whole value remounted.
 *
 * Purely visual: the whole thing is `aria-hidden` and carries no live region
 * of its own, since what that region should announce (remaining time, a new
 * quantity, a new price) is specific to the call site — pair this with your
 * own `aria-live` text alongside it, as Countdown and CartCounter both do.
 */
export function RollingDigits({ value, fontSize = "1em", weight = "semibold", color, monospace = true, className }: RollingDigitsProps) {
  const chars = Array.from(String(value));

  const rootStyle = {
    "--ds-rolling-digits-font-size": fontSize,
    "--ds-rolling-digits-weight": WEIGHT_VAR[weight],
    ...(color ? { "--ds-rolling-digits-color": COLOR_VAR[color] } : {}),
  } as CSSProperties;

  const rootClasses = ["ds-rolling-digits", monospace && "ds-rolling-digits--mono", className].filter(Boolean).join(" ");

  return (
    <span className={rootClasses} style={rootStyle} aria-hidden="true">
      {chars.map((char, index) =>
        /\d/.test(char) ? (
          <RollingDigit key={index} digit={Number(char)} />
        ) : (
          <span key={index} className="ds-rolling-digits__static">
            {char}
          </span>
        ),
      )}
    </span>
  );
}
