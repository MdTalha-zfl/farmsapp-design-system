import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactElement, type Ref } from "react";
import { Box, type BoxOwnProps, type Responsive, type SpaceStep } from "../Box/Box";

/**
 * Inline — a flex row with a required `gap`, plus a simplified boolean
 * `wrap` for tag lists, button groups, anything that needs to reflow onto
 * a new line rather than overflow or squeeze. Phase 5 Primitives roadmap,
 * Chunk 03. See Stack.tsx for why `gap` is required.
 *
 * `wrap` is a boolean, not Box's real three-value `flexWrap` — Inline's job
 * is answering one question ("should this reflow?"), not exposing the full
 * CSS surface. `wrap-reverse` and the bare three-state prop are still
 * reachable directly through Box for anything that needs them.
 */

// "unsafeStyle" excluded for the same reason as Stack — see the comment on
// StackOwnProps (Stack.tsx).
export interface InlineOwnProps extends Omit<BoxOwnProps, "display" | "flexDirection" | "flexWrap" | "unsafeStyle"> {
  gap: Responsive<SpaceStep>;
  wrap?: boolean;
}

// "color" excluded for the same reason as Box's own BoxProps<T> — see the
// comment there (Box.tsx).
export type InlineProps<T extends ElementType = "div"> = InlineOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof InlineOwnProps | "as" | "style" | "color">;

const InlineImpl = forwardRef<HTMLElement, InlineProps<ElementType>>(function Inline(
  { gap, wrap, ...props },
  ref,
) {
  // Omitting flexWrap entirely when wrap is false/unset (rather than
  // explicitly passing "nowrap") — nowrap is already flexbox's own default,
  // so setting it explicitly would just be one more atomic class shipped
  // for zero behavioral difference. Matches Box's own "don't set what you
  // don't need" discipline.
  return (
    <Box
      ref={ref}
      display="flex"
      flexDirection="row"
      gap={gap}
      {...(wrap ? { flexWrap: "wrap" as const } : {})}
      {...props}
    />
  );
});

export const Inline = InlineImpl as <T extends ElementType = "div">(
  props: InlineProps<T> & { ref?: Ref<HTMLElement> },
) => ReactElement | null;
