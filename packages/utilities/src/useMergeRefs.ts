import type { Ref, RefCallback } from "react";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && "current" in ref) {
    (ref as { current: T | null }).current = value;
  }
}

/**
 * Merges any number of refs (object refs, callback refs, or undefined) into
 * one callback ref that updates all of them. Needed by Tooltip to attach
 * both floating-ui's own `refs.setReference` and a cloned trigger element's
 * pre-existing `ref` (e.g. an IconButton passed as `children` that already
 * forwards its own ref) — React only accepts a single `ref` prop per
 * element, so cloning has to combine them into one.
 *
 * Deliberately not memoized: `refs` is a variable-length rest array, so
 * there's no real dependency list to give `useMemo`/`useCallback` — and
 * calling a fresh callback ref with the same value on every render is
 * harmless (React just re-invokes it), unlike memoizing a value with real,
 * static dependencies.
 */
export function useMergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) assignRef(ref, value);
  };
}
