/**
 * Shared hooks — Theme Runtime is done, Phase 5 (Primitives) starts here.
 * See System Blueprint §04. Focus management comes from
 * @floating-ui/react's FloatingFocusManager when Dialog/Menu/Popover are
 * built (Phase 7-8), not a hook in this package — see
 * decisions/decision-no-custom-focus-trap.md. RTL/dir helpers deliberately
 * cut — see decisions/decision-cut-rtl-utilities.md.
 */
export { useId } from "./useId";
export {
  useControllableState,
  type UseControllableStateProps,
  type ControllableStateSetter,
} from "./useControllableState";
export { useCallbackRef } from "./useCallbackRef";
export { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
