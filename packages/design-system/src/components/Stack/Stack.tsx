import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactElement, type Ref } from "react";
import { Box, type BoxOwnProps, type Responsive, type SpaceStep } from "../Box/Box";

/**
 * Stack — a flex column with a required `gap`. The single most common
 * layout need in the whole future component library, worth a name shorter
 * than repeating `display="flex" flexDirection="column" gap="..."` at
 * every call site. Phase 5 Primitives roadmap, Chunk 03.
 *
 * `gap` is required, not optional — unlike every other Box-derived prop.
 * An un-set gap silently defaults to 0 in CSS, which reads as "no spacing
 * decision was made" when it's actually "someone forgot." Forcing the
 * prop makes the omission impossible instead of just easy to miss in review.
 *
 * Uses the exact same forwardRef-then-cast pattern as Box itself (see
 * rca/rca-box-polymorphic-props-lost-type-safety.md) — forwardRef can't be
 * generic, so skipping the cast here would silently reintroduce that same
 * bug for Stack specifically.
 */

// "unsafeStyle" excluded too, not just "display"/"flexDirection" — it's
// Box's own internal escape hatch (decisions/decision-box-style-prop-locked-down.md),
// and Stack forwards its own rest props straight into Box's, so leaving it
// in StackOwnProps would let app code reach Box's unsafeStyle through
// Stack's public API, defeating the point of it not being public.
export interface StackOwnProps extends Omit<BoxOwnProps, "display" | "flexDirection" | "unsafeStyle"> {
  gap: Responsive<SpaceStep>;
}

export type StackProps<T extends ElementType = "div"> = StackOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof StackOwnProps | "as" | "style">;

const StackImpl = forwardRef<HTMLElement, StackProps<ElementType>>(function Stack(
  { gap, ...props },
  ref,
) {
  return <Box ref={ref} display="flex" flexDirection="column" gap={gap} {...props} />;
});

export const Stack = StackImpl as <T extends ElementType = "div">(
  props: StackProps<T> & { ref?: Ref<HTMLElement> },
) => ReactElement | null;
