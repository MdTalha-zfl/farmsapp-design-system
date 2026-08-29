import { forwardRef, type ComponentPropsWithoutRef } from "react";
import type { BoxOwnProps } from "../Box/Box";
import {
  type HeadingVariant,
  type LetterSpacingStep,
  type TypographyLang,
  type TextColor,
  type TextWeight,
  type TextDecorationLine,
  type TextWordBreak,
  type TextAlign,
  type TextTransform,
} from "../Box/resolveTypographyClasses";
import { BaseText } from "../BaseText/BaseText";

/**
 * Heading — see decisions/decision-heading-level-variant-decoupled.md for
 * why `level`/`variant` are both required with no implicit mapping (a
 * deliberate divergence from Blade's own Heading, which derives a default
 * tag from `size`) and decisions/decision-heading-blade-parity-props.md for
 * `weight`/`textDecorationLine`/`wordBreak`/`textAlign`/`textTransform`,
 * added after tracing Blade's real Heading component. The actual render
 * (variant/letterSpacing/color -> classes, Box render) now lives in the
 * shared `BaseText` — this file keeps only what's genuinely
 * Heading-exclusive: `level`'s tag mapping.
 */

export type { HeadingVariant, LetterSpacingStep, TextColor, TextWeight, TextDecorationLine, TextWordBreak, TextAlign, TextTransform };

export type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";

const LEVEL_TO_TAG = {
  "1": "h1",
  "2": "h2",
  "3": "h3",
  "4": "h4",
  "5": "h5",
  "6": "h6",
} as const;

export interface HeadingOwnProps extends Omit<BoxOwnProps, "unsafeStyle"> {
  level: HeadingLevel;
  variant: HeadingVariant;
  /** Restricted to string, unlike Text's ReactNode children — matching
   * Blade's real Heading/Display, which reserve rich composition (nesting a
   * bold span, an inline Code) for Text alone, so a heading's typography
   * stays uniform and can't accidentally be broken by a nested element. See
   * decisions/decision-heading-blade-parity-props.md. */
  children: string;
  letterSpacing?: LetterSpacingStep;
  lang?: TypographyLang;
  color?: TextColor;
  /** No default — variant's own composite font shorthand already sets a
   * sensible weight per size (bold for display, semibold for the rest);
   * this only applies when a call site wants to override it. Unlike
   * Blade's own Heading (which always forces a "semibold" default, because
   * Blade's Heading has no separate variant-driven weight to defer to —
   * it has no `variant` at all), forcing a default here would silently
   * change `display`'s own bold weight. See
   * decisions/decision-heading-blade-parity-props.md. */
  weight?: TextWeight;
  textDecorationLine?: TextDecorationLine;
  wordBreak?: TextWordBreak;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
}

export type HeadingProps = HeadingOwnProps &
  Omit<ComponentPropsWithoutRef<"h1">, keyof HeadingOwnProps | "style">;

const HeadingImpl = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level, variant, letterSpacing = "normal", lang, color, weight, textDecorationLine, wordBreak, textAlign, textTransform, className, ...props },
  ref,
) {
  const tag = LEVEL_TO_TAG[level];
  return (
    <BaseText
      ref={ref}
      as={tag}
      variant={variant}
      letterSpacing={letterSpacing}
      lang={lang}
      color={color}
      weight={weight}
      textDecorationLine={textDecorationLine}
      wordBreak={wordBreak}
      textAlign={textAlign}
      textTransform={textTransform}
      className={className}
      {...props}
    />
  );
});

export const Heading = HeadingImpl;
