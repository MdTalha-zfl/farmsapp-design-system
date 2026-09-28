import { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "../Text/Text";
import { RollingDigits } from "../RollingDigits/RollingDigits";

export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once `targetDate` has been reached — every field above is 0. */
  isComplete: boolean;
}

/** Own scale, not `InputSize` — this is a display/marketing piece, not a
 * form control, and a hero-banner placement wants boxes well past a form
 * input's largest step. */
export type CountdownSize = "small" | "medium" | "large" | "xlarge" | "2xlarge";

export interface CountdownProps {
  /** Moment to count down to. A past date renders as all-zero and fires
   * `onComplete` once, on mount. */
  targetDate: Date | number | string;
  /** Defaults to "medium". "xlarge"/"2xlarge" are for a hero/banner
   * placement — a full-width sale strip, a landing page above the fold. */
  size?: CountdownSize;
  /** Fires once, the instant the countdown reaches zero — not on every
   * render afterward. */
  onComplete?: () => void;
  /** Hides a unit box entirely instead of showing it at 0 — e.g. drop
   * "Days" for a sub-24-hour flash sale. Defaults to showing all four. */
  units?: Array<"days" | "hours" | "minutes" | "seconds">;
  /** Overrides the unit labels ("Days", "Hours", "Minutes", "Seconds"). */
  labels?: Partial<Record<"days" | "hours" | "minutes" | "seconds", string>>;
  accessibilityLabel?: string;
  className?: string;
}

const ALL_UNITS = ["days", "hours", "minutes", "seconds"] as const;
const DEFAULT_LABELS: Record<(typeof ALL_UNITS)[number], string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

// rem bounds (respects a user's browser/OS text-size setting, per
// decisions/decision-rem-for-typography-px-for-layout.md), a vw-relative
// middle step for viewport-driven shrinking — passed straight through to
// RollingDigits, which derives its own cell height from this.
const DIGIT_FONT_SIZE: Record<CountdownSize, string> = {
  small: "clamp(0.875rem, 4vw, 1rem)",
  medium: "clamp(1rem, 5vw, 1.25rem)",
  large: "clamp(1.125rem, 6vw, 1.5rem)",
  xlarge: "clamp(1.25rem, 7vw, 2rem)",
  "2xlarge": "clamp(1.5rem, 8vw, 2.75rem)",
};

function getTimeLeft(targetDate: Date | number | string): CountdownTimeLeft {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };

  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isComplete: false,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * A flash-sale / offer-expiry timer: one box per unit (days/hours/minutes/
 * seconds), each showing a zero-padded number over its label. Ticks every
 * second on its own via `targetDate` — the consumer never has to compute or
 * re-pass the remaining time.
 *
 * The whole thing is one `aria-live="polite"` region rather than per-second
 * updates being announced individually — a screen reader would otherwise
 * read out a new number every second, which is unusable. The visible boxes
 * are `aria-hidden` (via RollingDigits); the live region instead gets a
 * coarse, human sentence regenerated each render.
 */
export function Countdown({
  targetDate,
  size = "medium",
  onComplete,
  units = [...ALL_UNITS],
  labels,
  accessibilityLabel,
  className,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));
  const firedCompleteRef = useRef(false);

  useEffect(() => {
    firedCompleteRef.current = false;
    setTimeLeft(getTimeLeft(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    if (timeLeft.isComplete && !firedCompleteRef.current) {
      firedCompleteRef.current = true;
      onComplete?.();
    }
  }, [timeLeft.isComplete, onComplete]);

  const resolvedLabels = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);

  const spokenLabel =
    accessibilityLabel ??
    (timeLeft.isComplete
      ? "Countdown complete"
      : `${units
          .map((unit) => `${timeLeft[unit]} ${resolvedLabels[unit]}`)
          .join(", ")} remaining`);

  const rootClasses = ["ds-countdown", className].filter(Boolean).join(" ");

  return (
    <div className={rootClasses}>
      <div className="ds-countdown__boxes" aria-hidden="true">
        {units.map((unit) => (
          <div key={unit} className={`ds-countdown__unit ds-countdown__unit--size-${size}`}>
            <div className="ds-countdown__box">
              <RollingDigits value={pad(timeLeft[unit])} fontSize={DIGIT_FONT_SIZE[size]} />
            </div>
            <Text as="span" variant="caption" size="small" color="secondary" className="ds-countdown__label">
              {resolvedLabels[unit]}
            </Text>
          </div>
        ))}
      </div>
      <span className="ds-countdown__sr-only" role="status" aria-live="polite">
        {spokenLabel}
      </span>
    </div>
  );
}
