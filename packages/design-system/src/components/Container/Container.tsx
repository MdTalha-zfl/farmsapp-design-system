import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactElement, type Ref } from "react";
import { Box, type BoxOwnProps } from "../Box/Box";

/**
 * Container — max-width + horizontal centering. Phase 5 Primitives
 * roadmap, Chunk 03. The only primitive that reaches for a fixed
 * pixel-width scale rather than the spacing scale.
 *
 * `maxWidth`'s scale (tokens/container.json) is deliberately its OWN thing,
 * not a reuse of the breakpoint tokens — this project has THREE different
 * breakpoint-shaped token sets (consumer, portal, component; see
 * decisions/decision-component-breakpoint-scale.md), one per app plus one
 * shared one for Box's responsive props, and Container's max-width doesn't
 * cleanly belong to any of them: it's "how wide should this page's content
 * read," which the two apps can and do answer differently, but Container
 * itself lives in the one shared package both apps import. Rather than
 * having Container internally branch on "which app am I in" (real app
 * identity leaking into a supposedly generic primitive), it exposes its own
 * step scale — which width a given page wants becomes that page's own
 * choice at the call site (`<Container maxWidth="xl">`), the same
 * resolution already used for Box's breakpoints. See
 * decisions/decision-container-maxwidth-scale.md.
 *
 * Styling mechanism: a plain inline style with a var() reference, via Box's
 * `unsafeStyle` escape hatch, NOT Box's generated-atomic-class machinery.
 * Box's atomic classes exist to avoid a real per-render cost measured
 * across hundreds of densely-nested instances
 * (decisions/decision-box-atomic-css-over-inline-styles.md) — Container is
 * used once or twice per page, never densely repeated, so that cost
 * doesn't apply here. The var()-reference constraint
 * (decisions/decision-box-must-use-css-custom-properties.md) still does —
 * satisfied by referencing `var(--ds-container-max-width-*)` directly
 * rather than resolving to a literal pixel value. `unsafeStyle`, not a
 * plain `style` prop, because Box no longer accepts one at all — see
 * decisions/decision-box-style-prop-locked-down.md. Container itself
 * doesn't accept an external `style` prop either, for the same reason.
 */

const MAX_WIDTH_STEPS = ["sm", "md", "lg", "xl", "full"] as const;
type MaxWidth = (typeof MAX_WIDTH_STEPS)[number];

// "unsafeStyle" excluded for the same reason as Stack/Inline — Container's
// own internal use of it (below) is a direct JSX attribute on the Box it
// renders, not routed through ContainerOwnProps, so excluding it here only
// stops app code from reaching Box's escape hatch through Container's
// public API.
export interface ContainerOwnProps extends Omit<BoxOwnProps, "unsafeStyle"> {
  maxWidth: MaxWidth;
}

// "color" excluded for the same reason as Box's own BoxProps<T> — see the
// comment there (Box.tsx).
export type ContainerProps<T extends ElementType = "div"> = ContainerOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ContainerOwnProps | "as" | "style" | "color">;

// Runtime guard, same reason as Box's `as` allowlist warning: `maxWidth` is
// a plain string at the JS boundary (a non-TypeScript consumer, or a typo
// TS itself would catch but this still catches early and clearly either
// way) — dev-mode only, stripped by the consuming app's own bundler in a
// production build.
function warnIfUnknownMaxWidth(maxWidth: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (!(MAX_WIDTH_STEPS as readonly string[]).includes(maxWidth)) {
    console.warn(
      `@farmsapp/design-system: Container received maxWidth="${maxWidth}", which isn't one of ` +
        `${MAX_WIDTH_STEPS.join(", ")}.`,
    );
  }
}

const ContainerImpl = forwardRef<HTMLElement, ContainerProps<ElementType>>(function Container(
  { maxWidth, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== "production") warnIfUnknownMaxWidth(maxWidth);

  return (
    <Box
      ref={ref}
      marginX="auto"
      unsafeStyle={{
        // width: "100%" first — a flex item with auto side margins does NOT
        // stretch to fill its container's cross axis by default (auto
        // margins override align-items: stretch, a real CSS behavior, not
        // Box-specific), so without this Container shrinks to its content's
        // width and max-width never gets a chance to actually clip
        // anything. Found by checking computed styles, not just a
        // screenshot: max-width was resolving correctly (640px, 768px, ...)
        // the whole time, but Container's own width never grew past ~90px
        // of content. This also makes Container robust regardless of
        // whether its parent happens to be a block or flex container.
        width: "100%",
        ...(maxWidth === "full" ? {} : { maxWidth: `var(--ds-container-max-width-${maxWidth})` }),
      }}
      {...props}
    />
  );
});

export const Container = ContainerImpl as <T extends ElementType = "div">(
  props: ContainerProps<T> & { ref?: Ref<HTMLElement> },
) => ReactElement | null;
