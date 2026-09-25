import { useEffect, useState } from "react";
import { useControllableState } from "@farmsapp/utilities";
import { clamp, parseDraft, sanitizeDraft, stepValue } from "./counterMath";

/**
 * The counter's state and rules, with no DOM access (keys arrive as plain
 * strings, results are plain values) so a React Native component can reuse it.
 * See decisions/decision-counterinput-portable-usecounter-hook.md and
 * decisions/decision-counterinput-draft-then-commit.md.
 */

export interface UseCounterOptions {
  /** Controlled value. `null` is a controlled, empty field. */
  value?: number | null | undefined;
  defaultValue?: number | null | undefined;
  /** Defaults to 0. */
  min?: number | undefined;
  max?: number | undefined;
  /** A positive integer; defaults to 1. */
  step?: number | undefined;
  /** Defaults to `step * 10`. */
  pageStep?: number | undefined;
  isDisabled?: boolean | undefined;
  /** Fires only when the committed value changes. */
  onChange?: ((value: number | null) => void) | undefined;
}

export interface UseCounterResult {
  /** The committed value, `null` when empty. */
  value: number | null;
  /** What the text field shows: the draft while typing, else the value. */
  inputValue: string;
  min: number;
  max: number | undefined;
  isDecrementDisabled: boolean;
  isIncrementDisabled: boolean;
  /** Stores what was typed or pasted as the draft; commits nothing. */
  handleInputChange: (text: string) => void;
  /** Parses and clamps the draft into the value (blur, Enter). Returns the
   * committed value (the current one when nothing was being typed). */
  commitDraft: () => number | null;
  /** Return the new committed value. */
  increment: () => number | null;
  decrement: () => number | null;
  /** Returns true when the key was used (so the caller should preventDefault). */
  handleKeyDown: (key: string) => boolean;
}

function isPositiveInteger(n: number): boolean {
  return Number.isInteger(n) && n > 0;
}

export function useCounter({
  value: valueProp,
  defaultValue,
  min = 0,
  max,
  step: stepProp = 1,
  pageStep: pageStepProp,
  isDisabled = false,
  onChange,
}: UseCounterOptions): UseCounterResult {
  const step = isPositiveInteger(stepProp) ? stepProp : 1;
  const pageStep = pageStepProp !== undefined && isPositiveInteger(pageStepProp) ? pageStepProp : step * 10;

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!isPositiveInteger(stepProp)) {
      console.warn(`@farmsapp/design-system: CounterInput received step={${stepProp}}; it must be a positive integer. Using 1.`);
    }
    if (pageStepProp !== undefined && !isPositiveInteger(pageStepProp)) {
      console.warn(`@farmsapp/design-system: CounterInput received pageStep={${pageStepProp}}; it must be a positive integer. Using step * 10.`);
    }
    if (max !== undefined && min > max) {
      console.warn(`@farmsapp/design-system: CounterInput received min={${min}} greater than max={${max}}.`);
    }
  }, [stepProp, pageStepProp, min, max]);

  const [value, setValue] = useControllableState<number | null>({
    ...(valueProp !== undefined ? { value: valueProp } : {}),
    defaultValue: defaultValue ?? null,
    onChange: (next) => onChange?.(next),
  });

  // null: not being edited, show the committed value.
  const [draft, setDraft] = useState<string | null>(null);
  const allowNegative = min < 0;

  const inputValue = draft ?? (value === null ? "" : String(value));

  const commit = (next: number | null) => {
    setDraft(null);
    setValue(next);
    return next;
  };

  const commitDraft = () => {
    if (draft === null) return value;
    const parsed = parseDraft(draft);
    return commit(parsed === null ? null : clamp(parsed, min, max));
  };

  // A step starts from whatever is in the field, typed or committed.
  const stepBy = (direction: 1 | -1, amount: number) => {
    const base = draft !== null ? parseDraft(draft) : value;
    return commit(stepValue(base, direction, amount, min, max));
  };

  const handleKeyDown = (key: string): boolean => {
    if (isDisabled) return false;
    switch (key) {
      case "ArrowUp":
        stepBy(1, step);
        return true;
      case "ArrowDown":
        stepBy(-1, step);
        return true;
      case "PageUp":
        stepBy(1, pageStep);
        return true;
      case "PageDown":
        stepBy(-1, pageStep);
        return true;
      case "Home":
        commit(min);
        return true;
      case "End":
        if (max === undefined) return false;
        commit(max);
        return true;
      case "Enter":
        // Commit, but let the key through so an enclosing form still submits.
        commitDraft();
        return false;
      default:
        return false;
    }
  };

  return {
    value,
    inputValue,
    min,
    max,
    isDecrementDisabled: isDisabled || value === null || value <= min,
    isIncrementDisabled: isDisabled || (max !== undefined && value !== null && value >= max),
    handleInputChange: (text) => setDraft(sanitizeDraft(text, allowNegative)),
    commitDraft,
    increment: () => stepBy(1, step),
    decrement: () => stepBy(-1, step),
    handleKeyDown,
  };
}
