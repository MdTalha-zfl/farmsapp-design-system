import { forwardRef, type ElementRef, type ReactElement, type ReactNode, type Ref } from "react";
import { Text as RNText, type TextStyle } from "react-native";
import {
  TextDisplay,
  TextHeadingLg,
  TextHeadingMd,
  TextHeadingSm,
  TextBodyMd,
  TextBodySm,
  TextCaption,
  ColorTextPrimary,
  ColorTextSecondary,
  ColorTextDisabled,
  ColorTextInverse,
  ColorTextDanger,
  ColorTextWarning,
  ColorTextSuccess,
  FontWeightRegular,
  FontWeightMedium,
  FontWeightSemibold,
} from "@farmsapp/tokens";
import type {
  TextVariantStep,
  HeadingVariant,
  TextColor,
  TextWeight,
  TextAlign,
  TextTransform,
  TextDecorationLine,
  LetterSpacingStep,
  TypographyLang,
} from "../Box/resolveTypographyClasses";

const VARIANT_TOKENS: Record<
  TextVariantStep | HeadingVariant,
  { fontFamily: readonly string[]; fontSize: number; fontWeight: number; lineHeight: number; letterSpacing: number }
> = {
  display: TextDisplay,
  "heading-lg": TextHeadingLg,
  "heading-md": TextHeadingMd,
  "heading-sm": TextHeadingSm,
  "body-md": TextBodyMd,
  "body-sm": TextBodySm,
  caption: TextCaption,
};

const COLOR_VALUES: Record<TextColor, string> = {
  primary: ColorTextPrimary,
  secondary: ColorTextSecondary,
  disabled: ColorTextDisabled,
  inverse: ColorTextInverse,
  danger: ColorTextDanger,
  warning: ColorTextWarning,
  success: ColorTextSuccess,
};

const WEIGHT_VALUES: Record<TextWeight, TextStyle["fontWeight"]> = {
  regular: String(FontWeightRegular) as TextStyle["fontWeight"],
  medium: String(FontWeightMedium) as TextStyle["fontWeight"],
  semibold: String(FontWeightSemibold) as TextStyle["fontWeight"],
};

export const BASE_FONT_SIZE = 16;

function warnIfUnsupported(prop: string, value: unknown): void {
  if (!__DEV__) return;
  console.warn(
    `@farmsapp/design-system: BaseText.native received ${prop}="${String(value)}", which has no React Native equivalent. Ignored.`,
  );
}

function resolveLetterSpacing(
  letterSpacing: LetterSpacingStep,
  lang: TypographyLang | undefined,
  fontSizePx: number,
  letterSpacingEm: number,
): number {
  if (lang === "hi" && letterSpacing !== "normal") {
    if (__DEV__) {
      console.warn(
        `@farmsapp/design-system: letterSpacing="${letterSpacing}" was requested together with lang="hi" — ` +
          `letter-spacing tokens are Latin-script only (Devanagari tracking can break how glyphs join). ` +
          `Forcing letterSpacing="normal" instead.`,
      );
    }
    return 0;
  }
  // Token letterSpacing is an em-like multiplier (CSS convention); React
  // Native's letterSpacing style wants a real point value, so it's scaled
  // by the resolved font size, same conversion as fontSize/lineHeight below.
  return letterSpacing === "normal" ? 0 : letterSpacingEm * fontSizePx;
}

export interface BaseTextNativeOwnProps {
  variant: TextVariantStep | HeadingVariant;
  // `| undefined` explicitly, not just `?:` — Text.native/Heading.native
  // pass through possibly-undefined destructured prop values directly (not
  // omitting the key), which `exactOptionalPropertyTypes` treats as a
  // different case from omission. Same fix as the web BaseTextOwnProps.
  color?: TextColor | undefined;
  weight?: TextWeight | undefined;
  letterSpacing?: LetterSpacingStep | undefined;
  lang?: TypographyLang | undefined;
  textAlign?: TextAlign | undefined;
  textTransform?: TextTransform | undefined;
  textDecorationLine?: TextDecorationLine | undefined;
  truncateAfterLines?: number | undefined;
  /** Real px override for Text's own `size` prop — independent of
   * `variant`, same relationship as web's standalone `font-size` CSS
   * declaration cascading over variant's own composite shorthand.
   * `lineHeight` still recomputes from `variant`'s own ratio against this
   * overridden size, matching how CSS's unitless line-height naturally
   * recomputes against whatever font-size is actually in effect. */
  fontSizeOverride?: number | undefined;
  children?: ReactNode;
}

type MutableTextStyle = { -readonly [K in keyof TextStyle]: TextStyle[K] };
type ViewRef = ElementRef<typeof RNText>;

const BaseTextNativeImpl = forwardRef<ViewRef, BaseTextNativeOwnProps>(function BaseText(
  { variant, color, weight, letterSpacing = "normal", lang, textAlign, textTransform, textDecorationLine, truncateAfterLines, fontSizeOverride, children },
  ref,
) {
  const tokens = VARIANT_TOKENS[variant];
  const fontSize = fontSizeOverride ?? tokens.fontSize * BASE_FONT_SIZE;

  const style: MutableTextStyle = {
    fontFamily: tokens.fontFamily[0],
    fontSize,
    lineHeight: tokens.lineHeight * fontSize,
    fontWeight: weight ? WEIGHT_VALUES[weight] : (String(tokens.fontWeight) as TextStyle["fontWeight"]),
    letterSpacing: resolveLetterSpacing(letterSpacing, lang, fontSize, tokens.letterSpacing),
  };

  if (color !== undefined) style.color = COLOR_VALUES[color];
  if (textAlign !== undefined) style.textAlign = textAlign;
  if (textTransform !== undefined) style.textTransform = textTransform;

  if (textDecorationLine === "dotted") {
    style.textDecorationLine = "underline";
    style.textDecorationStyle = "dotted";
  } else if (textDecorationLine !== undefined) {
    style.textDecorationLine = textDecorationLine;
  }

  return (
    <RNText
      ref={ref}
      style={style as TextStyle}
      numberOfLines={truncateAfterLines}
      ellipsizeMode={truncateAfterLines !== undefined ? "tail" : undefined}
    >
      {children}
    </RNText>
  );
});

export const BaseText = BaseTextNativeImpl as (
  props: BaseTextNativeOwnProps & { ref?: Ref<ViewRef> },
) => ReactElement | null;

// wordBreak has no React Native equivalent — exported so Text.native/
// Heading.native can dev-warn on it without duplicating the message.
export { warnIfUnsupported };
