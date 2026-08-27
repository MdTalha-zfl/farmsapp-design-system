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

  unsafeStyle?: CSSProperties;
}

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
 * scales with props actually passed, not with the size of the prop schema.
 *
 * Exported (not just used internally by Box itself) — the same seam
 * Blade's own `makeBoxProps` exists for: a future component that can't
 * just render `<Box as="...">` (ALLOWED_AS_TAGS excludes interactive/
 * semantic elements like button/a/input, same reasoning as Blade's own
 * validBoxAsValues) but still wants to accept Box-style layout props
 * (padding, margin, ...) on its own render tree can resolve them to real
 * class names the same way Box itself does, without duplicating this
 * function. No real consumer yet (Phase 7's Button/Input haven't been
 * built) — exported now anyway since it's a zero-behavior-change, cheap
 * seam to have ready, not a new public-package API commitment (not
 * re-exported from index.tsx yet; that's a separate decision for whenever
 * a real external consumer need shows up). */
export function resolveBoxClassNames(props: BoxOwnProps): string[] {
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

const BOX_OWN_PROP_KEYS = new Set(PROP_CONFIG.keys());

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

export type BoxProps<T extends ElementType = "div"> = BoxOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BoxOwnProps | "as" | "style" | "color">;

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
