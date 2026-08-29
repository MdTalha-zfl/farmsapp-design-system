import { forwardRef, type ElementRef, type ReactElement, type Ref } from "react";
import {
  Pressable,
  Platform,
  type GestureResponderEvent,
  type ViewStyle,
  type Insets,
  type PressableAndroidRippleConfig,
} from "react-native";
import {
  ColorActionPrimary,
  ColorActionPrimaryActive,
  ColorActionPrimaryDisabled,
  ColorActionSecondary,
  ColorActionSecondaryActive,
  ColorActionSecondaryDisabled,
  ColorActionTertiaryActive,
  ColorActionNegative,
  ColorActionNegativeActive,
  ColorActionNegativeDisabled,
  ColorBorderDefault,
  ColorBorderSubtle,
  RadiusSm,
  RadiusMd,
  Space2,
  Space3,
  Space4,
  BorderWidthThin,
} from "@farmsapp/tokens";
import { Text } from "../Text/Text.native";
import type { TextColor } from "../Text/Text";
import { Spinner } from "../Spinner/Spinner.native";
import { resolveNativeStyle, type BoxNativeOwnProps } from "../Box/Box.native";
import { resolveBaseButtonState } from "./resolveBaseButtonState";
import type { ButtonVariant, ButtonSize } from "./BaseButton";


const SIZE_STYLES: Record<ButtonSize, { minHeight: number; paddingHorizontal: number; borderRadius: number }> = {
  xsmall: { minHeight: 26, paddingHorizontal: Space2, borderRadius: RadiusSm },
  small: { minHeight: 30, paddingHorizontal: Space2, borderRadius: RadiusSm },
  medium: { minHeight: 32, paddingHorizontal: Space3, borderRadius: RadiusSm },
  large: { minHeight: 36, paddingHorizontal: Space4, borderRadius: RadiusMd },
};

// xsmall/small's own minHeight (26/30) falls under Android's 48dp/iOS's 44pt
// minimum-touch-target guidance — real accessibility guidance, not a
// stylistic nicety (see Android Material's "Touch target size" and Apple's
// HIG "Minimum tappable area"). A default hitSlop makes the tappable area
// meet that minimum without visually growing the button itself. medium/
// large already meet it, so their default is 0 (a no-op). Always
// overridable via the `hitSlop` prop for callers with denser layouts.
const DEFAULT_HIT_SLOP: Record<ButtonSize, number> = {
  xsmall: 11,
  small: 9,
  medium: 0,
  large: 0,
};

interface VariantColors {
  background: string;
  backgroundPressed: string;
  backgroundDisabled: string;
  borderColor: string;
  borderColorDisabled: string;
  textColor: TextColor;
}

// Hover has no native equivalent (see file header) — "pressed" reuses each
// variant's own web `:active`/`:focus-visible` color, the nearest already-
// designed color for a non-rest state.
const VARIANT_COLORS: Record<ButtonVariant, VariantColors> = {
  primary: {
    background: ColorActionPrimary,
    backgroundPressed: ColorActionPrimaryActive,
    backgroundDisabled: ColorActionPrimaryDisabled,
    borderColor: "transparent",
    borderColorDisabled: "transparent",
    textColor: "inverse",
  },
  secondary: {
    background: ColorActionSecondary,
    backgroundPressed: ColorActionSecondaryActive,
    backgroundDisabled: ColorActionSecondaryDisabled,
    borderColor: "transparent",
    borderColorDisabled: "transparent",
    textColor: "primary",
  },
  tertiary: {
    background: "transparent",
    backgroundPressed: ColorActionTertiaryActive,
    backgroundDisabled: "transparent",
    borderColor: ColorBorderDefault,
    borderColorDisabled: ColorBorderSubtle,
    textColor: "primary",
  },
  negative: {
    background: ColorActionNegative,
    backgroundPressed: ColorActionNegativeActive,
    backgroundDisabled: ColorActionNegativeDisabled,
    borderColor: "transparent",
    borderColorDisabled: ColorBorderSubtle,
    textColor: "inverse",
  },
};

interface BaseButtonNativeCommonOwnProps
  extends Pick<BoxNativeOwnProps, "margin" | "marginTop" | "marginRight" | "marginBottom" | "marginLeft" | "marginX" | "marginY"> {
  /** Defaults to "primary". */
  variant?: ButtonVariant;
  /** Defaults to "medium". */
  size?: ButtonSize;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  isLoading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  /** Expands the tappable area beyond the visible bounds without changing
   * layout — passed straight through to `Pressable`. Defaults per `size`
   * (see `DEFAULT_HIT_SLOP`) so `xsmall`/`small` meet the platform-minimum
   * touch target even though their visible height doesn't; pass `0` to
   * opt out entirely. */
  hitSlop?: Insets | number;
  /** Android's real ripple feedback — has no iOS equivalent (iOS instead
   * gets the `pressed`-state background swap below). Defaults to a ripple
   * tinted with this variant's own `:active` color; pass `false` to turn it
   * off (e.g. inside a custom-drawn surface where a ripple would clip
   * wrong), or a full config to override color/radius/`borderless`. */
  android_ripple?: PressableAndroidRippleConfig | false;
}

export interface BaseButtonNativeOwnProps extends BaseButtonNativeCommonOwnProps {
  children: string;
  /** Not required on native — there's no icon-only variant here (see file
   * header), so `children` alone is always a real accessible name. Kept
   * optional only for API-shape parity with web. */
  accessibilityLabel?: string;
}

type MutableViewStyle = { -readonly [K in keyof ViewStyle]: ViewStyle[K] };
export type ButtonRef = ElementRef<typeof Pressable>;

const BaseButtonNativeImpl = forwardRef<ButtonRef, BaseButtonNativeOwnProps>(function BaseButton(
  {
    variant = "primary",
    size = "medium",
    isDisabled = false,
    isFullWidth = false,
    isLoading = false,
    onPress,
    hitSlop,
    android_ripple,
    children,
    accessibilityLabel,
    ...marginProps
  },
  ref,
) {
  // No icon/link concept on native (see file header) — hasIcon/isLink are
  // always false, so this collapses to `disabled = isLoading || isDisabled`,
  // but goes through the same shared function web's BaseButton.tsx uses so
  // the two platforms can't silently drift on this formula.
  const { disabled, spinnerSize, textSize } = resolveBaseButtonState({
    size,
    hasIcon: false,
    childrenString: children,
    isDisabled,
    isLoading,
    isLink: false,
    accessibilityLabel,
  });
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];
  // Reuses Box.native's own margin resolution directly on the Pressable
  // root — a nested `<Box><Pressable/></Box>` would make `isFullWidth`'s
  // `width: "100%"` resolve against the Box's own content-sized (not
  // parent-relative) width instead of the real parent, so margin is merged
  // into this element's style instead of wrapping in a second element.
  const marginStyle = resolveNativeStyle(marginProps);
  const resolvedHitSlop = hitSlop ?? DEFAULT_HIT_SLOP[size];

  // Android gets real ripple feedback instead of the `pressed`-state
  // background swap below — running both at once double-signals the same
  // press and looks muddy (the swap's flat color fights the ripple's own
  // spreading-circle animation). `disabled` suppresses the ripple the same
  // way `Pressable` itself already suppresses onPress.
  const resolvedRipple: PressableAndroidRippleConfig | undefined =
    android_ripple === false || disabled ? undefined : (android_ripple ?? { color: colors.backgroundPressed });
  const isAndroid = Platform.OS === "android";

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      hitSlop={resolvedHitSlop}
      android_ripple={resolvedRipple}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ disabled, busy: isLoading }}
      style={({ pressed }): ViewStyle => {
        const style: MutableViewStyle = {
          ...marginStyle,
          minHeight: sizeStyle.minHeight,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
          borderWidth: BorderWidthThin,
          borderColor: disabled ? colors.borderColorDisabled : colors.borderColor,
          backgroundColor: disabled
            ? colors.backgroundDisabled
            : pressed && !isAndroid
              ? colors.backgroundPressed
              : colors.background,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        };
        if (isFullWidth) style.width = "100%";
        return style;
      }}
    >
      {isLoading ? (
        <Spinner size={spinnerSize} accessibilityLabel="Loading" />
      ) : (
        <Text variant="body" size={textSize} color={disabled ? "disabled" : colors.textColor}>
          {children}
        </Text>
      )}
    </Pressable>
  );
});

export const BaseButton = BaseButtonNativeImpl as (
  props: BaseButtonNativeOwnProps & { ref?: Ref<ButtonRef> },
) => ReactElement | null;
