import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactElement, type Ref } from "react";
import { Box, type BoxOwnProps } from "../Box/Box";
import {
  resolveTypographyClasses,
  resolveExtraTypographyClasses,
  type TextVariantStep,
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

export interface BaseTextOwnProps extends Omit<BoxOwnProps, "unsafeStyle"> {
  as: ElementType;
  variant: TextVariantStep | HeadingVariant;
  /** Defaults to "normal". */
  letterSpacing?: LetterSpacingStep;
  // `| undefined` explicitly, not just `?:` — Text.tsx/Heading.tsx pass
  // through possibly-undefined destructured prop values directly (not
  // omitting the key), which `exactOptionalPropertyTypes` (tsconfig.base.json)
  // treats as a different case from omission. Same fix already established
  // for resolveExtraTypographyClasses's own params.
  lang?: TypographyLang | undefined;
  color?: TextColor | undefined;
  weight?: TextWeight | undefined;
  textDecorationLine?: TextDecorationLine | undefined;
  wordBreak?: TextWordBreak | undefined;
  textAlign?: TextAlign | undefined;
  textTransform?: TextTransform | undefined;
  truncateAfterLines?: number | undefined;
}

export type BaseTextProps = BaseTextOwnProps &
  Omit<ComponentPropsWithoutRef<"span">, keyof BaseTextOwnProps | "as" | "style">;

const BaseTextImpl = forwardRef<HTMLElement, BaseTextProps>(function BaseText(
  {
    as,
    variant,
    letterSpacing = "normal",
    lang,
    color,
    weight,
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
  const typographyClasses = resolveTypographyClasses(variant, letterSpacing, lang, color);
  const extraClasses = resolveExtraTypographyClasses({ weight, textDecorationLine, wordBreak, textAlign, textTransform });
  const finalClassName = [typographyClasses, extraClasses, className].filter(Boolean).join(" ");

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
      as={as}
      lang={lang}
      className={finalClassName}
      {...(truncateStyle ? { unsafeStyle: truncateStyle } : {})}
      {...props}
    />
  );
});

export const BaseText = BaseTextImpl as (props: BaseTextProps & { ref?: Ref<HTMLElement> }) => ReactElement | null;
