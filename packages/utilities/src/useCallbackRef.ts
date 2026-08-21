import React, { useCallback, useRef, type DependencyList } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// Accessed indirectly rather than as a direct `React.useInsertionEffect`
// reference, to avoid a real, reported webpack static-analysis issue when
// the hook isn't present on the resolved React version:
// https://github.com/webpack/webpack/issues/14814#issuecomment-1536757985
// https://github.com/radix-ui/primitives/issues/2796
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useReactInsertionEffect = (React as any)[" useInsertionEffect ".trim()];
const useEarliestEffect = useReactInsertionEffect ?? useIsomorphicLayoutEffect;

/**
 * Returns a stable function reference that always calls the latest version
 * of `callback`, without needing `callback` itself in a dependency array —
 * a user-land approximation of React's still-experimental `useEffectEvent`
 * (https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event).
 *
 * Updates the ref via `useInsertionEffect` where available — the earliest
 * point React runs any effect, before layout effects and passive effects,
 * so the ref is guaranteed fresh before anything else in the tree could
 * read it. Falls back to `useIsomorphicLayoutEffect` (which itself falls
 * back further to plain `useEffect` on the server) if `useInsertionEffect`
 * isn't available on the resolved React version. A plain `useEffect` alone
 * — this project's first attempt — isn't wrong for SSR (it's always a
 * no-op-safe choice there), but it's the least-eager of the three options,
 * with a real, if narrow, staleness window: anything with earlier effect
 * timing than a passive effect could still read a stale callback.
 */
export function useCallbackRef<Args extends unknown[], Return>(
  callback: ((...args: Args) => Return) | undefined,
  deps: DependencyList = [],
): (...args: Args) => Return | undefined {
  const callbackRef = useRef(callback);

  useEarliestEffect(() => {
    callbackRef.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((...args: Args) => callbackRef.current?.(...args), deps);
}
