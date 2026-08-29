import type { IconSize } from "@farmsapp/icons";
import type { SpinnerSize } from "../Spinner/Spinner";
import type { BaseTextSizes } from "../Text/Text";
import type { ButtonSize } from "./BaseButton";
import {
  buttonSizeToIconSizeMap,
  buttonIconOnlySizeToIconSizeMap,
  buttonSizeToSpinnerSizeMap,
  buttonSizeToTextSizeMap,
} from "./buttonTokens";

/**
 * Shared, platform-agnostic Button logic — computed once and consumed by
 * both `BaseButton.tsx` (web) and `BaseButton.native.tsx`, matching the
 * *principle* behind Blade's real `BaseButton.tsx` (their single,
 * non-platform-split file that computes tokens/state/accessibility once and
 * only delegates actual rendering to thin `StyledBaseButton.web/.native`
 * leaves — confirmed directly from Blade's source).
 *
 * This project can't copy Blade's file *structure* verbatim: Blade ships
 * raw source and lets each consuming app's own bundler (Metro for native,
 * webpack/vite + react-native-web for web) resolve a plain `./Foo` import to
 * `Foo.native.tsx`/`Foo.web.tsx` automatically. This package instead
 * pre-builds two separate Rollup bundles (`index.js`/`index.native.js` —
 * see decisions/decision-badge-react-native-support-chunk-1.md) since this
 * package's own build tool is Rollup, not Metro, and Rollup has no such
 * extension-resolution convention. A single `BaseButton.tsx` importing a
 * hardcoded `./StyledBaseButton` would bake in ONE platform's leaf for both
 * bundles — wrong for whichever platform didn't get chosen. So instead of
 * one shared *component* delegating to a platform leaf, the shared surface
 * here is a plain function with zero platform-specific imports, safely
 * includable in both bundles, called by each platform's own real component.
 *
 * There's also a real, deliberate reason this project can't go as far as
 * Blade in what gets shared: Blade computes actual resolved color VALUES in
 * JS for both platforms (`getBackgroundColorToken()` etc.), because neither
 * of Blade's platforms uses a browser CSS cascade the way this project's
 * web components do. This project's web Button deliberately stays
 * CSS-custom-property-driven (see project memory "TS tokens vs CSS vars") so
 * that runtime brand/dark-mode switching keeps working without a JS
 * re-render — computing real hex values in a shared function and handing
 * them to web would silently break that. Native has no CSS engine at all,
 * so it genuinely needs real values — which is exactly why
 * `BaseButton.native.tsx` still keeps its own `VARIANT_COLORS`/`SIZE_STYLES`
 * tables locally rather than importing them from here. What IS safely
 * shared below is the color-and-CSS-agnostic slice: disabled computation,
 * icon-only detection, and which size step each sub-component (icon/
 * spinner/text) should render at — none of that differs by platform.
 */

export interface ResolveBaseButtonStateInput {
  size: ButtonSize;
  hasIcon: boolean;
  childrenString: string | undefined;
  isDisabled: boolean;
  isLoading: boolean;
  /** True for web's `href`-driven anchor render — native has no link
   * concept, so `BaseButton.native.tsx` always passes `false`. A real
   * `<a>` can't be disabled the way a `<button>` can, so link buttons only
   * ever go inert via `isLoading`, matching the existing web-only nuance
   * `BaseButton.tsx` already had before this extraction. */
  isLink: boolean;
  accessibilityLabel: string | undefined;
}

export interface BaseButtonResolvedState {
  disabled: boolean;
  isIconOnly: boolean;
  iconSize: IconSize;
  spinnerSize: SpinnerSize;
  textSize: BaseTextSizes;
}

function warnIfMissingAccessibilityLabel(isIconOnly: boolean, accessibilityLabel: string | undefined): void {
  if (process.env.NODE_ENV === "production") return;
  if (isIconOnly && !accessibilityLabel) {
    console.warn(
      "@farmsapp/design-system: Button received an icon with no visible text and no accessibilityLabel — " +
        "an icon-only button needs accessibilityLabel to have a real accessible name.",
    );
  }
}

export function resolveBaseButtonState({
  size,
  hasIcon,
  childrenString,
  isDisabled,
  isLoading,
  isLink,
  accessibilityLabel,
}: ResolveBaseButtonStateInput): BaseButtonResolvedState {
  const isIconOnly = hasIcon && (!childrenString || childrenString.trim().length === 0);
  if (process.env.NODE_ENV !== "production") warnIfMissingAccessibilityLabel(isIconOnly, accessibilityLabel);

  return {
    disabled: isLoading || (isDisabled && !isLink),
    isIconOnly,
    iconSize: isIconOnly ? buttonIconOnlySizeToIconSizeMap[size] : buttonSizeToIconSizeMap[size],
    spinnerSize: buttonSizeToSpinnerSizeMap[size],
    textSize: buttonSizeToTextSizeMap[size],
  };
}
