import { cloneElement, useContext, useState, type ReactElement } from "react";
import { useMergeRefs } from "@farmsapp/utilities";
import { useIsomorphicLayoutEffect } from "@farmsapp/utilities";
import { SpotlightPopoverTourContext } from "./SpotlightPopoverTour";

export interface SpotlightPopoverTourStepProps {
  /** Must match a `name` in the parent `SpotlightPopoverTour`'s `steps` array. */
  name: string;
  /** Single child — cloned with a merged ref so `SpotlightPopoverTour` can measure and
   * spotlight it. */
  children: ReactElement;
}

/**
 * SpotlightPopoverTourStep — marks one target element for a `SpotlightPopoverTour`. Clones its child and
 * registers `(name, element)` with the nearest `SpotlightPopoverTour` via context, the same
 * targeting mechanism Blade's real SpotlightPopoverTourStep uses — chosen
 * (not a CSS selector/id lookup) because it's the one approach that will
 * still work if this project ever needs the same API on React Native,
 * which has no `id`/`querySelector`. See
 * decisions/decision-tour-api-and-structure.md.
 */
export function SpotlightPopoverTourStep({ name, children }: SpotlightPopoverTourStepProps) {
  const ctx = useContext(SpotlightPopoverTourContext);
  const [node, setNode] = useState<HTMLElement | null>(null);

  // React 18 puts `ref` directly on the element; React 19 folds it into
  // `props.ref` instead — same dual handling as Popover.tsx/Tooltip.tsx.
  const childRef =
    (children as unknown as { ref?: unknown }).ref ?? (children.props as { ref?: unknown } | undefined)?.ref;
  const mergedRef = useMergeRefs(setNode, childRef as never);

  useIsomorphicLayoutEffect(() => {
    if (!ctx || !node) return;
    ctx.attachStep(name, node);
    return () => ctx.detachStep(name);
  }, [ctx, name, node]);

  if (process.env.NODE_ENV !== "production" && !ctx) {
    console.warn(`@farmsapp/design-system: <SpotlightPopoverTourStep name="${name}"> must be rendered inside a <SpotlightPopoverTour>.`);
  }

  return cloneElement(children, { ref: mergedRef } as Record<string, unknown>);
}
