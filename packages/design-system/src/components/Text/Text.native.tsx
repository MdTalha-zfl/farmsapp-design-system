import { forwardRef, type ElementRef, type ReactElement, type ReactNode, type Ref } from "react";
import type { Text as RNText } from "react-native";
import { FontSizeXsmall, FontSizeSmall, FontSizeMedium, FontSizeLarge, FontSizeXlarge, FontSize2xlarge } from "@farmsapp/tokens";
import { BaseText, BASE_FONT_SIZE, warnIfUnsupported } from "../BaseText/BaseText.native";
import type { TextVariantStep } from "../Box/resolveTypographyClasses";
import type { TextVariant, BaseTextSizes, CaptionTextSize, TextColor, TextWeight, TextDecorationLine, TextAlign, TextTransform } from "./Text";

/**
 * Text.native — React Native counterpart to the web `Text`. Same
 * variant->token-step mapping and caption-scoped `size` logic as the web
 * version; the actual render delegates to `BaseText.native`, mirroring how
 * `Text.tsx` delegates to the web `BaseText`. See
 * decisions/decision-text-heading-react-native-support-chunk-3.md.
 *
 * Deliberately reduced scope, matching `BaseText.native`'s own disclosed
 * cuts: no `wordBreak` (dev-warns, ignored), no `lang`-driven HTML
 * attribute (the Devanagari letterSpacing safety guard still applies).
 */

const VARIANT_TO_TOKEN_STEP: Record<TextVariant, TextVariantStep> = {
  body: "body-md",
  caption: "caption",
};

const SIZE_VALUES: Record<BaseTextSizes, number> = {
  xsmall: FontSizeXsmall,
  small: FontSizeSmall,
  medium: FontSizeMedium,
  large: FontSizeLarge,
  xlarge: FontSizeXlarge,
  "2xlarge": FontSize2xlarge,
};

const CAPTION_SIZES: readonly CaptionTextSize[] = ["xsmall", "small"];

export interface TextNativeProps {
  variant?: TextVariant;
  size?: BaseTextSizes;
  weight?: TextWeight;
  color?: TextColor;
  letterSpacing?: "tight" | "normal" | "wide";
  lang?: "en" | "hi";
  textDecorationLine?: TextDecorationLine;
  wordBreak?: never; // dev-warns, see BaseText.native's own scope note.
  textAlign?: TextAlign;
  textTransform?: TextTransform;
  truncateAfterLines?: number;
  children?: ReactNode;
}

type ViewRef = ElementRef<typeof RNText>;

const TextImpl = forwardRef<ViewRef, TextNativeProps>(function Text(
  {
    variant = "body",
    size,
    weight,
    color,
    letterSpacing,
    lang,
    textDecorationLine,
    wordBreak,
    textAlign,
    textTransform,
    truncateAfterLines,
    children,
  },
  ref,
) {
  const variantStep = VARIANT_TO_TOKEN_STEP[variant];

  let effectiveWeight = weight;
  if (variant === "caption" && weight !== undefined) {
    if (__DEV__) {
      console.warn(
        `@farmsapp/design-system: Text received weight="${weight}" together with variant="caption" — ` +
          `captions always render at weight "regular"; the weight prop is ignored.`,
      );
    }
    effectiveWeight = undefined;
  }

  if (wordBreak !== undefined && __DEV__) warnIfUnsupported("wordBreak", wordBreak);

  let fontSizeOverride: number | undefined;
  if (size !== undefined && variant === "caption" && !CAPTION_SIZES.includes(size as CaptionTextSize)) {
    if (__DEV__) {
      console.warn(
        `@farmsapp/design-system: Text received size="${size}" together with variant="caption" — ` +
          `caption only supports ${CAPTION_SIZES.join("/")}. The size override is ignored; caption's own default size applies.`,
      );
    }
  } else if (size !== undefined) {
    fontSizeOverride = SIZE_VALUES[size] * BASE_FONT_SIZE;
  }

  return (
    <BaseText
      ref={ref}
      variant={variantStep}
      color={color}
      weight={effectiveWeight}
      letterSpacing={letterSpacing}
      lang={lang}
      textDecorationLine={textDecorationLine}
      textAlign={textAlign}
      textTransform={textTransform}
      truncateAfterLines={truncateAfterLines}
      fontSizeOverride={fontSizeOverride}
    >
      {children}
    </BaseText>
  );
});

export const Text = TextImpl as (props: TextNativeProps & { ref?: Ref<ViewRef> }) => ReactElement | null;
