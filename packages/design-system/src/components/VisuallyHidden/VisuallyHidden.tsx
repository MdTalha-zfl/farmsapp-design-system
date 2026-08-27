import { forwardRef, type ReactNode } from "react";

/**
 * VisuallyHidden — content present in the DOM and the accessibility tree,
 * but never visually rendered. Phase 5 Primitives roadmap (deferred, then
 * pulled back in as a Phase 7 prerequisite alongside Icon).
 *
 * Matches Blade's real, traced VisuallyHidden exactly: `children` only, no
 * `as` prop, no id-generation logic of its own (id-for-labelling patterns
 * belong to whatever *consumes* this component, e.g. via `useId`, never to
 * VisuallyHidden itself — confirmed from Blade's real source, correcting an
 * earlier assumption in this project's own LEARNING.md), no focus-reveal
 * variant (that's a structurally separate future component, not this one —
 * Blade's own skip-link handles it by importing the raw CSS technique
 * directly and layering its own `:focus` override, not by extending
 * VisuallyHidden). See decisions/decision-visually-hidden-minimal-scope.md.
 *
 * The CSS technique itself lives in base.css's `.ds-visually-hidden` class,
 * not here — a fixed, non-prop-driven class, same reasoning that put the
 * page-level reset there.
 */

export interface VisuallyHiddenProps {
  children: ReactNode;
}

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(function VisuallyHidden(
  { children },
  ref,
) {
  return (
    <span ref={ref} className="ds-visually-hidden">
      {children}
    </span>
  );
});
