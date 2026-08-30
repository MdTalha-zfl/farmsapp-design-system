/**
 * The single published component library — Box, Stack, Inline, Container,
 * Text, Heading, Icon, VisuallyHidden land starting Phase 5; Button, Input,
 * Dialog, Menu, and the rest starting Phase 7 (System Blueprint §07 for the
 * prop vocabulary every component must follow).
 */
export const DESIGN_SYSTEM_PACKAGE_VERSION = "0.0.0" as const;

export {
  Box,
  type BoxProps,
  type BoxOwnProps,
  type SpaceStep,
  type MarginStep,
  type Responsive,
  type SurfaceColor,
  type BorderColor,
  type Radius,
  type BorderWidth,
  type MarginProps,
} from "./components/Box/Box";
export { Stack, type StackProps, type StackOwnProps } from "./components/Stack/Stack";
export { Inline, type InlineProps, type InlineOwnProps } from "./components/Inline/Inline";
export { Container, type ContainerProps, type ContainerOwnProps } from "./components/Container/Container";
export {
  Text,
  type TextProps,
  type TextOwnProps,
  type TextBodyOwnProps,
  type TextCaptionOwnProps,
  type TextVariant,
  type TextAsTag,
  type BaseTextSizes,
  type CaptionTextSize,
} from "./components/Text/Text";
export {
  Heading,
  type HeadingProps,
  type HeadingOwnProps,
  type HeadingLevel,
  type HeadingVariant,
} from "./components/Heading/Heading";
export { VisuallyHidden, type VisuallyHiddenProps } from "./components/VisuallyHidden/VisuallyHidden";
export { Spinner, type SpinnerProps, type SpinnerSize } from "./components/Spinner/Spinner";
export {
  Button,
  type ButtonOwnProps,
  type ButtonWithChildrenOwnProps,
  type ButtonIconOnlyOwnProps,
  type ButtonVariant,
  type ButtonSize,
  type ButtonIconPosition,
} from "./components/Button/Button";
export {
  IconButton,
  type IconButtonProps,
  type IconButtonEmphasis,
  type IconButtonSize,
} from "./components/IconButton/IconButton";
export {
  Badge,
  type BadgeOwnProps,
  type BadgeColor,
  type BadgeEmphasis,
  type BadgeSize,
} from "./components/Badge/Badge";
export {
  Divider,
  type DividerOwnProps,
  type DividerOrientation,
  type DividerStyle,
  type DividerVariant,
  type DividerThickness,
} from "./components/Divider/Divider";
export type {
  LetterSpacingStep,
  TypographyLang,
  TextColor,
  TextWeight,
  TextDecorationLine,
  TextWordBreak,
  TextAlign,
  TextTransform,
} from "./components/Box/resolveTypographyClasses";
