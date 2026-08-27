import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactElement, type ReactNode, type Ref } from "react";
import {
  SPACE_PROPS,
  KEYWORD_PROPS,
  TOKEN_COLOR_PROPS,
  TOKEN_SCALE_PROPS,
  className as atomicClassName,
} from "./atomicConfig.mjs";
import { VALID_STEPS } from "./generatedValidSteps.mjs";

/**
 * Box — every other Phase 5 primitive (Stack, Inline, Container, Text) is
 * either this or built on it. See decisions/decision-box-atomic-css-over-inline-styles.md
 * for why props resolve to pre-generated class names (build/css/atomic.css)
 * instead of a runtime style object: zero per-render style computation, real
 * @media support, and no SSR/RSC friction since it's a plain `className`
 * string, not a runtime-injected <style> tag.
 *
 * Every prop resolves to a var(--ds-*) reference at build time — never a
 * flattened literal — per decisions/decision-box-must-use-css-custom-properties.md,
 * satisfied here because atomic.css's rules are var()-only by construction
 * (see generate-atomic-css.mjs).
 */

// Exported — Stack/Inline/Container (and later Text) are compositions of
// Box, not independent implementations, and reuse these same value scales
// rather than redefining them, per decisions/decision-box-atomic-css-over-inline-styles.md's
// "not a speculative full CSS surface" scope: one definition of what a
// valid spacing/color/radius step is, shared everywhere.
export type SpaceStep = "0" | "0-5" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16";
export type MarginStep = SpaceStep | "auto";
export type Responsive<T> = T | { base?: T; md?: T; lg?: T };

export type SurfaceColor = "base" | "raised" | "sunken" | "overlay";
export type BorderColor = "subtle" | "default" | "strong";
// TextColor moved to resolveTypographyClasses.ts, 2026-08-22 — Box no
// longer has a text-color concept at all, matching Blade's real BaseBox
// (backgroundColor/borderColor only; text coloring is BaseText's exclusive
// concern). See decisions/decision-text-heading-own-typography-props.md's
// "Update" section.
export type Radius = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type BorderWidth = "thin" | "thick" | "heavy";

export interface BoxOwnProps {
  padding?: Responsive<SpaceStep>;
  paddingTop?: Responsive<SpaceStep>;
  paddingRight?: Responsive<SpaceStep>;
  paddingBottom?: Responsive<SpaceStep>;
  paddingLeft?: Responsive<SpaceStep>;
  paddingX?: Responsive<SpaceStep>;
  paddingY?: Responsive<SpaceStep>;
  margin?: Responsive<MarginStep>;
  marginTop?: Responsive<MarginStep>;
  marginRight?: Responsive<MarginStep>;
  marginBottom?: Responsive<MarginStep>;
  marginLeft?: Responsive<MarginStep>;
  marginX?: Responsive<MarginStep>;
  marginY?: Responsive<MarginStep>;
  gap?: Responsive<SpaceStep>;
  rowGap?: Responsive<SpaceStep>;
  columnGap?: Responsive<SpaceStep>;
  display?: Responsive<"none" | "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "contents">;
  flexDirection?: Responsive<"row" | "column" | "row-reverse" | "column-reverse">;
  flexWrap?: Responsive<"wrap" | "nowrap" | "wrap-reverse">;
  alignItems?: Responsive<"start" | "center" | "end" | "stretch" | "baseline">;
  justifyContent?: Responsive<"start" | "center" | "end" | "between" | "around" | "evenly">;
  backgroundColor?: SurfaceColor;
  borderColor?: BorderColor;
  borderRadius?: Radius;
  borderWidth?: BorderWidth;
  children?: ReactNode;
  /**
   * Escape hatch for first-party Box-derived primitives (Container's
   * maxWidth mechanism today; future primitives that need one raw CSS
   * declaration Box's own prop surface doesn't cover) — NOT part of Box's
   * public contract for application code. Box's plain `style` prop is
   * deliberately not exposed at all: an inline style silently outranks
   * Box's own computed atomic classes via CSS specificity, the same risk
   * Razorpay Blade's BaseBox cites for the identical design choice
   * (rfcs/2023-01-06-layout.md: "a padding property on CSS can mess up the
   * built-in spacing on a component"). App code that finds itself reaching
   * for `unsafeStyle` should add the missing prop to atomicConfig.mjs
   * instead — see decisions/decision-box-style-prop-locked-down.md.
   */
  unsafeStyle?: CSSProperties;
}

// One merged lookup, built once at module load — NOT per render. Box's
// resolver below walks Object.entries(props) (bounded by what a given
// instance actually sets) and does an O(1) map lookup per prop, rather than
// looping the full ~27-key schema on every render regardless of how many
// props are actually used. The first version of this file did the latter
// and measured SLOWER than a naive per-render inline-style object build in
// scratch-bench.mjs — the same class of mistake Blade's own real BaseBox
// made (walking its whole prop schema every render) before being flagged
// for it. See decisions/decision-box-atomic-css-over-inline-styles.md.
const PROP_CONFIG = new Map<string, { prefix: string; responsive: boolean; varCategory?: string }>();
for (const [key, cfg] of Object.entries(SPACE_PROPS)) PROP_CONFIG.set(key, { prefix: cfg.prefix, responsive: true });
for (const [key, cfg] of Object.entries(KEYWORD_PROPS)) PROP_CONFIG.set(key, { prefix: cfg.prefix, responsive: true });
for (const [key, cfg] of Object.entries(TOKEN_COLOR_PROPS))
  PROP_CONFIG.set(key, { prefix: cfg.prefix, responsive: false, varCategory: cfg.varCategory });
for (const [key, cfg] of Object.entries(TOKEN_SCALE_PROPS))
  PROP_CONFIG.set(key, { prefix: cfg.prefix, responsive: false, varCategory: cfg.varCategory });

function isResponsiveObject(value: unknown): value is { base?: unknown; md?: unknown; lg?: unknown } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Dev-mode-only guard for Box's color/radius/borderWidth props specifically
// (decisions/decision-box-runtime-token-validation.md) — TypeScript already
// restricts these to a closed union at compile time, so this only matters
// for a type-bypass or non-TypeScript caller. Without it, an invalid value
// silently produces a class name with no matching CSS rule in
// build/css/atomic.css — the exact same failure shape as the
// RESPONSIVE_PROP_KEYS bug found earlier, just reachable a different way.
// Matches Blade's own equivalent guard on its public Box component
// (validateBackgroundString), which throws in dev; this warns instead, to
// stay consistent with every other dev-mode guard already in this file
// (warnIfDisallowedTag, the dropped-"style"-prop warning) rather than
// introducing a throw as the one exception.
function warnIfInvalidTokenValue(propKey: string, varCategory: string | undefined, value: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  if (!varCategory || typeof value !== "string") return;
  const validSteps = VALID_STEPS[varCategory];
  if (validSteps && !validSteps.includes(value)) {
    console.warn(
      `@farmsapp/design-system: Box received ${propKey}="${value}", which isn't one of ` +
        `${validSteps.join(", ")}. This will render a class name with no matching CSS rule.`,
    );
  }
}

/** Resolves BoxOwnProps to the pre-generated class name list — no style
 * object, no CSS computation, just string lookups against a naming
 * convention shared with generate-atomic-css.mjs (atomicClassName). Cost
 * scales with props actually passed, not with the size of the prop schema. */
function resolveBoxClassNames(props: BoxOwnProps): string[] {
  const classes: string[] = [];

  for (const [propKey, value] of Object.entries(props)) {
    if (value === undefined) continue;
    const cfg = PROP_CONFIG.get(propKey);
    if (!cfg) continue; // not a style prop (children, as, ...) — left for the caller to pass through.
    if (cfg.responsive && isResponsiveObject(value)) {
      if (value.base !== undefined) classes.push(atomicClassName(cfg.prefix, value.base as string));
      if (value.md !== undefined) classes.push(atomicClassName(cfg.prefix, value.md as string, "md"));
      if (value.lg !== undefined) classes.push(atomicClassName(cfg.prefix, value.lg as string, "lg"));
    } else {
      if (process.env.NODE_ENV !== "production") warnIfInvalidTokenValue(propKey, cfg.varCategory, value);
      classes.push(atomicClassName(cfg.prefix, value as string));
    }
  }

  return classes;
}

// Deliberately NOT including "children" — it's a style prop's opposite (a
// pass-through prop), and needs to flow into `rest` below so Component
// actually renders it. The first version of this file excluded it here,
// which meant Box never rendered any children at all — caught by the real
// browser check in this chunk's verification, not by tsc or eslint (a
// completely valid TS type, an empty <div>, nothing to statically flag).
const BOX_OWN_PROP_KEYS = new Set(PROP_CONFIG.keys());

// Dev-mode-only guard against passing an arbitrary/unsafe element to `as` —
// validated pattern from Blade (real allowlist, not a speculative addition
// here). Only runs when NODE_ENV !== "production", stripped by the
// consuming app's own bundler dead-code elimination in a production build.
// h1-h6 added in Phase 5 Chunk 04: Heading.tsx renders `<Box as={tag}>`
// internally for its real, structural h1-h6 tag — caught by this exact
// warning firing on every single Heading render before the fix (verified
// via a real renderToString probe, not assumed), since the allowlist
// hadn't been told about the one first-party component that now legitimately
// needs these tags. Unlike `button` (deliberately still excluded — a real
// interactive element needs its own dedicated component with keyboard/ARIA
// handling that doesn't exist yet), heading tags are purely structural, and
// the "dedicated component instead of Box's as prop" the warning message
// itself asks for now exists (Heading) and is exactly what produces this.
const ALLOWED_AS_TAGS = new Set([
  "div", "span", "section", "article", "header", "footer", "nav", "main",
  "aside", "ul", "ol", "li", "figure", "figcaption", "label", "form",
  "h1", "h2", "h3", "h4", "h5", "h6",
]);

function warnIfDisallowedTag(as: ElementType): void {
  if (process.env.NODE_ENV === "production") return;
  if (typeof as !== "string") return;
  if (!ALLOWED_AS_TAGS.has(as)) {
    console.warn(
      `@farmsapp/design-system: Box received as="${as}", which isn't in Box's allowed tag list. ` +
        `Box is a layout primitive — interactive/semantic elements (button, a, input, ...) should use ` +
        `a dedicated component instead of Box's "as" prop.`,
    );
  }
}

// "color" excluded explicitly, not just via keyof BoxOwnProps (which no
// longer lists it) — React's own base HTMLAttributes<T> declares a generic,
// non-standard `color?: string` attribute every element inherits (see the
// "Non-standard Attributes" section of @types/react's index.d.ts). Without
// this exclusion, removing `color` from BoxOwnProps let it silently leak
// back in from React's own types: untyped, unvalidated, and — worse than a
// type gap — it would render as a literal HTML `color` DOM attribute (not
// CSS), which has no visual effect on a div/span at all. Caught by a real
// throwaway type-error probe (a directive comment expecting a compile
// error) that unexpectedly stayed silent, not assumed safe just because
// BoxOwnProps itself looked right. Same shape as the "style" exclusion
// just above it.
export type BoxProps<T extends ElementType = "div"> = BoxOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BoxOwnProps | "as" | "style" | "color">;

// React.forwardRef is not itself generic — the render function's props type
// gets fixed at definition time, so `forwardRef<HTMLElement, BoxProps<ElementType>>`
// locked every *call site* to the widest possible `T = ElementType`,
// regardless of the actual `as` value passed there. `ComponentPropsWithoutRef`
// over that wide a union includes an effectively-`any`-shaped branch (from
// `ComponentType<any>`), which silently disabled excess-property checking
// for every Box usage in the whole project — confirmed by testing, not
// assumed: a deliberately made-up prop name (`thisIsCompletelyMadeUp={12345}`)
// typechecked with zero errors before this fix. The standard, well-known
// workaround (used by most polymorphic-`as` component libraries, since
// forwardRef itself can't be generic) is casting the forwardRef result to a
// hand-written generic call signature below, restoring real per-call-site
// type inference for `T`.
const BoxImpl = forwardRef<HTMLElement, BoxProps<ElementType>>(function Box(
  { as, className, unsafeStyle, ...props },
  ref,
) {
  const Component = as ?? "div";
  if (process.env.NODE_ENV !== "production") warnIfDisallowedTag(Component);

  const boxClasses = resolveBoxClassNames(props);
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    // Not reachable through BoxProps<T>'s public type (style is excluded
    // there) — this only fires for a non-TypeScript caller or a type
    // bypass, but still drops it rather than trusting the type system
    // alone, matching warnIfDisallowedTag's dev-mode-warn-and-correct
    // pattern just below.
    if (key === "style") {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `@farmsapp/design-system: Box received a "style" prop, which isn't part of its public API — ` +
            `an inline style silently outranks Box's own computed classes via CSS specificity. Use Box's ` +
            `own style props instead; a first-party Box-derived primitive needing a raw CSS escape hatch ` +
            `should use "unsafeStyle".`,
        );
      }
      continue;
    }
    if (!BOX_OWN_PROP_KEYS.has(key)) rest[key] = value;
  }

  const finalClassName = [...boxClasses, className].filter(Boolean).join(" ");

  return <Component ref={ref} className={finalClassName || undefined} style={unsafeStyle} {...rest} />;
});

export const Box = BoxImpl as <T extends ElementType = "div">(
  props: BoxProps<T> & { ref?: Ref<HTMLElement> },
) => ReactElement | null;
