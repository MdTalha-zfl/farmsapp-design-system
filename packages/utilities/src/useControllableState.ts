import { useCallback, useState } from "react";
import { useCallbackRef } from "./useCallbackRef";

function defaultShouldUpdate<T>(prevValue: T, nextValue: T): boolean {
  return prevValue !== nextValue;
}

export interface UseControllableStateProps<T> {
  /** The controlled value. Presence (not truthiness) of this prop decides controlled vs. uncontrolled. */
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
  /**
   * Gate for whether a set actually applies. Defaults to a reference
   * inequality check. Wrapped in useCallbackRef below so passing a fresh
   * inline comparator every render doesn't defeat the setter's own
   * memoization — a real, load-bearing option in Blade's own
   * useControllableState (confirmed via Blade comparison, Phase 5
   * planning), not a speculative addition.
   */
  shouldUpdate?: (prevValue: T, nextValue: T) => boolean;
}

export type ControllableStateSetter<T> = (
  next: T | ((prevValue: T) => T),
  /**
   * When true, updates internal/controlled state without calling onChange
   * — for syncing state from somewhere other than a user action (e.g. an
   * external prop change) without re-triggering the same change handler
   * that reacts to user-driven changes. Also confirmed load-bearing in
   * Blade's real usage, not speculative.
   */
  skipUpdate?: boolean,
) => void;

/**
 * The controlled/uncontrolled dual-mode pattern every interactive
 * component in Phase 6+ will need — a `value`/`onChange` pair with an
 * internal fallback when the consumer doesn't control it.
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
  shouldUpdate = defaultShouldUpdate,
}: UseControllableStateProps<T>): [T, ControllableStateSetter<T>] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = useCallbackRef(onChange);
  const handleShouldUpdate = useCallbackRef(shouldUpdate);

  const setValue = useCallback<ControllableStateSetter<T>>(
    (next, skipUpdate) => {
      const nextValue = typeof next === "function" ? (next as (prevValue: T) => T)(value) : next;

      if (!handleShouldUpdate(value, nextValue)) return;

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      if (!skipUpdate) {
        handleChange(nextValue);
      }
    },
    [value, isControlled, handleChange, handleShouldUpdate],
  );

  return [value, setValue];
}
