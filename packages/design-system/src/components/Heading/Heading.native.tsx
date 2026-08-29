import { forwardRef, type ElementRef, type Ref, type ReactElement } from "react";
import type { Text as RNText } from "react-native";
import { BaseText, warnIfUnsupported } from "../BaseText/BaseText.native";
import type { HeadingLevel, HeadingVariant, TextColor, TextWeight, TextDecorationLine, TextAlign, TextTransform } from "./Heading";

/**
 * Heading.native — React Native counterpart to the web `Heading`. React
 * Native has no semantic heading elements (`<h1>`-`<h6>`) — `level` is kept
 * on the props purely for API-shape parity with web (a future
 * accessibility pass could map it to `accessibilityRole="header"` +
 * `accessibilityLevel`, not attempted in this first slice) and is
 * otherwise unused for rendering; `variant` alone drives the actual
 * typography, delegated to `BaseText.native`, mirroring how `Heading.tsx`
 * delegates to the web `BaseText`. See
 * decisions/decision-text-heading-react-native-support-chunk-3.md.
 */

export interface HeadingNativeProps {
  level: HeadingLevel;
  variant: HeadingVariant;
  children: string;
  letterSpacing?: "tight" | "normal" | "wide";
  lang?: "en" | "hi";
  color?: TextColor;
  weight?: TextWeight;
  textDecorationLine?: TextDecorationLine;
  wordBreak?: never; // dev-warns, see BaseText.native's own scope note.
  textAlign?: TextAlign;
  textTransform?: TextTransform;
}

type ViewRef = ElementRef<typeof RNText>;

const HeadingImpl = forwardRef<ViewRef, HeadingNativeProps>(function Heading(
  { variant, letterSpacing, lang, color, weight, textDecorationLine, wordBreak, textAlign, textTransform, children },
  ref,
) {
  if (wordBreak !== undefined && __DEV__) warnIfUnsupported("wordBreak", wordBreak);

  return (
    <BaseText
      ref={ref}
      variant={variant}
      letterSpacing={letterSpacing}
      lang={lang}
      color={color}
      weight={weight}
      textDecorationLine={textDecorationLine}
      textAlign={textAlign}
      textTransform={textTransform}
    >
      {children}
    </BaseText>
  );
});

export const Heading = HeadingImpl as (props: HeadingNativeProps & { ref?: Ref<ViewRef> }) => ReactElement | null;
