import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ReactElement, type Ref } from "react";
import { Box, type BoxOwnProps } from "../Box/Box";
import { TOKEN_TEXT_PROPS, className as atomicClassName } from "../Box/atomicConfig.mjs";
import {
  resolveTypographyClasses,
  resolveExtraTypographyClasses,
  warnIfInvalidStep,
  type TextVariantStep,
  type LetterSpacingStep,
  type TypographyLang,
  type TextColor,
  type TextWeight,
  type TextDecorationLine,
  type TextWordBreak,
  type TextAlign,
  type TextTransform,
} from "../Box/resolveTypographyClasses";

/**
 * Text — body/caption-level typography. Phase 5 Primitives roadmap, Chunk 04.
 * See decisions/decision-text-heading-own-typography-props.md for why
 * `variant`/`letterSpacing`/`color` resolve independently of Box's own
 * resolver, decisions/decision-devanagari-letter-spacing-guard.md for the
 * `lang` prop and the letterSpacing safety guard,
 * decisions/decision-text-as-tag-and-variant-narrowed.md for `as`/`variant`
 * narrowing, decisions/decision-text-size-prop.md and
 * decisions/decision-text-size-scoped-to-variant.md for `size`'s discriminated,
 * variant-scoped shape, and decisions/decision-heading-blade-parity-props.md
 * for `weight`/`textDecorationLine`/`wordBreak`/`textAlign`/`textTransform`
 * moving into the shared `resolveExtraTypographyClasses` (also used by
 * Heading) rather than staying Text-only.
 */

export type TextVariant = "body" | "caption";
export type TextAsTag = "p" | "span" | "div" | "abbr" | "figcaption" | "cite" | "q" | "label";
export type BaseTextSizes = "xsmall" | "small" | "medium" | "large" | "xlarge" | "2xlarge";

export type { LetterSpacingStep, TextColor, TextWeight, TextDecorationLine, TextWordBreak, TextAlign, TextTransform };

// Public variant names map to the real composite text.* token step names —
// narrowed deliberately (no "body-md"/"body-sm" split exposed). "body"
// resolves to "body-md" specifically — the more common default.
const VARIANT_TO_TOKEN_STEP: Record<TextVariant, TextVariantStep> = {
  body: "body-md",
  caption: "caption",
};

// Sizes reachable when a caption "steps up" from its own base size — one
// step only (xsmall -> small, matching body-sm's own size), never further.
// See decisions/decision-text-size-scoped-to-variant.md.
export type CaptionTextSize = Extract<BaseTextSizes, "xsmall" | "small">;

interface TextCommonOwnProps extends Omit<BoxOwnProps, "unsafeStyle"> {
  as?: TextAsTag;
  /** Defaults to "normal" — tight/wide tracking is opt-in only, never
   * applied implicitly by variant. */
  letterSpacing?: LetterSpacingStep;
  /** Explicit script signal (decisions/decision-devanagari-letter-spacing-guard.md)
   * — also sets the real HTML `lang` attribute on the rendered element. */
  lang?: TypographyLang;
  /** No default — leaving it unset lets ordinary CSS inheritance carry an
   * ancestor's color through. Deliberately NOT Blade's own behavior (Blade
   * always resolves a concrete default) — this project's root gallery
   * wrapper depends on an unset color falling through via inheritance. */
  color?: TextColor;
  /** "dotted" isn't a real text-decoration-line CSS keyword — it's a
   * convenience value meaning underline + a dotted text-decoration-style. */
  textDecorationLine?: TextDecorationLine;
  wordBreak?: TextWordBreak;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
  /** Line-clamp truncation — a real per-instance number, not a design-token
   * step, applied via Box's `unsafeStyle` escape hatch, not an atomic class. */
  truncateAfterLines?: number;
}

export interface TextBodyOwnProps extends TextCommonOwnProps {
  /** Defaults to "body" — the common case shouldn't require stating the
   * obvious at every call site. */
  variant?: Extract<TextVariant, "body">;
  /** No default — variant already sets a sensible font-size via its
   * composite font shorthand; this overrides just that one component. */
  size?: BaseTextSizes;
  /** No default — variant already sets a sensible weight via its composite
   * font shorthand; this only applies when a call site wants to override it. */
  weight?: TextWeight;
}

export interface TextCaptionOwnProps extends TextCommonOwnProps {
  variant: Extract<TextVariant, "caption">;
  /** Scoped to just xsmall/small, not the full BaseTextSizes union. */
  size?: CaptionTextSize;
  /** Always "regular" for captions, matching Blade's own forced behavior —
   * typed `never` (not omitted) so a caller passing any real weight gets a
   * compile error immediately. */
  weight?: never;
}

export type TextOwnProps = TextBodyOwnProps | TextCaptionOwnProps;

export type TextProps = TextOwnProps &
  Omit<ComponentPropsWithoutRef<"span">, keyof TextBodyOwnProps | keyof TextCaptionOwnProps | "as" | "style">;

// caption's own allowed size set, checked at runtime as a defense-in-depth
// backstop for non-TypeScript callers — TypeScript already blocks this at
// the call site via TextCaptionOwnProps' narrower `size` type.
const CAPTION_SIZES: readonly CaptionTextSize[] = ["xsmall", "small"];

const TextImpl = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as,
    variant = "body",
    letterSpacing = "normal",
    lang,
    color,
    weight,
    size,
    textDecorationLine,
    wordBreak,
    textAlign,
    textTransform,
    truncateAfterLines,
    className,
    ...props
  },
  ref,
) {
  const variantStep = VARIANT_TO_TOKEN_STEP[variant];
  const typographyClasses = resolveTypographyClasses(variantStep, letterSpacing, lang, color);

  const extraClasses: string[] = [];
  // Captions never carry a weight override — forced to "regular" via
  // variant's own composite font shorthand. Blocked at the type level
  // already (TextCaptionOwnProps' weight is `never`); this only fires for a
  // non-TypeScript caller that bypassed it.
  let effectiveWeight = weight;
  if (variant === "caption" && weight !== undefined) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `@farmsapp/design-system: Text received weight="${weight}" together with variant="caption" — ` +
          `captions always render at weight "regular"; the weight prop is ignored.`,
      );
    }
    effectiveWeight = undefined;
  }
  if (size !== undefined && variant === "caption" && !CAPTION_SIZES.includes(size as CaptionTextSize)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `@farmsapp/design-system: Text received size="${size}" together with variant="caption" — ` +
          `caption only supports ${CAPTION_SIZES.join("/")}. The size override is ignored; caption's own default size applies.`,
      );
    }
  } else if (size !== undefined) {
    if (process.env.NODE_ENV !== "production") warnIfInvalidStep("size", TOKEN_TEXT_PROPS.size.varCategory, size);
    extraClasses.push(atomicClassName(TOKEN_TEXT_PROPS.size.prefix, size));
  }
  extraClasses.push(resolveExtraTypographyClasses({ weight: effectiveWeight, textDecorationLine, wordBreak, textAlign, textTransform }));

  const finalClassName = [typographyClasses, ...extraClasses, className].filter(Boolean).join(" ");

  // -webkit-line-clamp requires this exact combination to actually clip —
  // a real, well-known CSS pattern, still requiring the -webkit- prefix in
  // every current browser.
  const truncateStyle: CSSProperties | undefined =
    truncateAfterLines !== undefined
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: truncateAfterLines,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }
      : undefined;

  return (
    <Box
      ref={ref}
      as={as ?? "span"}
      lang={lang}
      className={finalClassName}
      {...(truncateStyle ? { unsafeStyle: truncateStyle } : {})}
      {...props}
    />
  );
});

export const Text = TextImpl as (props: TextProps & { ref?: Ref<HTMLElement> }) => ReactElement | null;
