/**
 * React Native entry point — resolved automatically via this package's
 * `"react-native"` export condition (package.json). Mirrors index.tsx's
 * shape but only exports what actually has a native implementation today.
 *
 * Badge (chunk 1) + Box (chunk 2) + Text/Heading (chunk 3) + Spinner
 * (chunk 4) + Button (chunk 5) so far — see project memory "React Native
 * future support" and decisions/decision-when-to-use-box-vs-native-element.md's
 * sibling reasoning. IconButton/Stack/Inline/Container/etc. get their own
 * `*.native.tsx` + an export added here once ported, not before.
 */
export const DESIGN_SYSTEM_PACKAGE_VERSION = "0.0.0";

export {
  Badge,
  type BadgeNativeProps,
  type BadgeColor,
  type BadgeEmphasis,
  type BadgeSize,
} from "./components/Badge/Badge.native";

export { Box, type BoxNativeOwnProps } from "./components/Box/Box.native";
export type { SpaceStep, MarginStep, SurfaceColor, BorderColor, Radius, BorderWidth } from "./components/Box/Box";

export { Text, type TextNativeProps } from "./components/Text/Text.native";
export { Heading, type HeadingNativeProps } from "./components/Heading/Heading.native";
export type {
  TextVariant,
  BaseTextSizes,
  CaptionTextSize,
  TextColor,
  TextWeight,
  TextDecorationLine,
  TextAlign,
  TextTransform,
} from "./components/Text/Text";
export type { HeadingLevel, HeadingVariant } from "./components/Heading/Heading";

export { Spinner, type SpinnerNativeProps, type SpinnerNativeSize } from "./components/Spinner/Spinner.native";

export { Button, type ButtonNativeProps, type ButtonVariant, type ButtonSize } from "./components/Button/Button.native";
