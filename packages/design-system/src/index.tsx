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
export { FormLabel, type FormLabelProps, type FormLabelPosition, type FormLabelNecessityIndicator, type FormLabelSize } from "./components/FormLabel/FormLabel";
export { FormHint, type FormHintProps, type FormHintType, type FormHintSize } from "./components/FormHint/FormHint";
export { CharacterCounter, type CharacterCounterProps, type CharacterCounterSize } from "./components/CharacterCounter/CharacterCounter";
export { TextInput, type TextInputProps, type TextInputType } from "./components/Input/TextInput/TextInput";
export { PasswordInput, type PasswordInputProps } from "./components/Input/PasswordInput/PasswordInput";
export { SearchInput, type SearchInputProps } from "./components/Input/SearchInput/SearchInput";
export { TextArea, type TextAreaProps } from "./components/Input/TextArea/TextArea";
export type { InputSize, ValidationState, NecessityIndicator, FormInputLabelProps, FormInputValidationProps } from "./components/Input/types";
export { Tooltip, type TooltipProps, type TooltipPlacement } from "./components/Tooltip/Tooltip";
export { TooltipInteractiveWrapper, type TooltipInteractiveWrapperProps } from "./components/Tooltip/TooltipInteractiveWrapper";
export { Popover, type PopoverProps, type PopoverPlacement } from "./components/Popover/Popover";
export {
  PopoverInteractiveWrapper,
  type PopoverInteractiveWrapperProps,
} from "./components/Popover/PopoverInteractiveWrapper";
export { Modal, type ModalProps, type ModalSize } from "./components/Modal/Modal";
export { ModalHeader, type ModalHeaderProps } from "./components/Modal/ModalHeader";
export { ModalBody, type ModalBodyProps } from "./components/Modal/ModalBody";
export { ModalFooter, type ModalFooterProps } from "./components/Modal/ModalFooter";
export { Tabs, type TabsProps, type TabsOrientation, type TabsSize, type TabsVariant } from "./components/Tabs/Tabs";
export { TabList, type TabListProps } from "./components/Tabs/TabList";
export { TabItem, type TabItemProps, type TabItemIconComponent } from "./components/Tabs/TabItem";
export { TabPanel, type TabPanelProps } from "./components/Tabs/TabPanel";
export { Checkbox, type CheckboxProps } from "./components/Checkbox/Checkbox";
export { CheckboxGroup, type CheckboxGroupProps } from "./components/Checkbox/CheckboxGroup/CheckboxGroup";
export { Radio, type RadioProps } from "./components/Radio/Radio";
export { RadioGroup, type RadioGroupProps } from "./components/Radio/RadioGroup/RadioGroup";
export {
  Switch,
  type SwitchProps,
  type SwitchWithChildrenProps,
  type SwitchWithoutChildrenProps,
  type SwitchSize,
} from "./components/Switch/Switch";
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
