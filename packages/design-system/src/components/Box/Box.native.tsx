import { forwardRef, type ElementRef, type ReactElement, type ReactNode, type Ref } from "react";
import { View, type ViewStyle } from "react-native";
import {
  Space0,
  Space05,
  Space1,
  Space2,
  Space3,
  Space4,
  Space5,
  Space6,
  Space8,
  Space10,
  Space12,
  Space16,
  RadiusNone,
  RadiusSm,
  RadiusMd,
  RadiusLg,
  RadiusXl,
  RadiusFull,
  BorderWidthThin,
  BorderWidthThick,
  BorderWidthHeavy,
  ColorSurfaceBase,
  ColorSurfaceRaised,
  ColorSurfaceSunken,
  ColorBorderSubtle,
  ColorBorderDefault,
  ColorBorderStrong,
} from "@farmsapp/tokens";
import { SPACE_PROPS, KEYWORD_PROPS, TOKEN_COLOR_PROPS, TOKEN_SCALE_PROPS } from "./atomicConfig.mjs";
import type { BoxOwnProps, SurfaceColor, Responsive } from "./Box";

const SPACE_VALUES: Record<string, number> = {
  "0": Space0,
  "0-5": Space05,
  "1": Space1,
  "2": Space2,
  "3": Space3,
  "4": Space4,
  "5": Space5,
  "6": Space6,
  "8": Space8,
  "10": Space10,
  "12": Space12,
  "16": Space16,
};

const TOKEN_VALUES: Record<string, Record<string, number | string>> = {
  radius: { none: RadiusNone, sm: RadiusSm, md: RadiusMd, lg: RadiusLg, xl: RadiusXl, full: RadiusFull },
  "border-width": { thin: BorderWidthThin, thick: BorderWidthThick, heavy: BorderWidthHeavy },
  "color-border": { subtle: ColorBorderSubtle, default: ColorBorderDefault, strong: ColorBorderStrong },
  // "overlay" deliberately omitted — see scope note above.
  "color-surface": { base: ColorSurfaceBase, raised: ColorSurfaceRaised, sunken: ColorSurfaceSunken },
};

const RN_KEY_OVERRIDES: Record<string, keyof ViewStyle> = {
  paddingX: "paddingHorizontal",
  paddingY: "paddingVertical",
  marginX: "marginHorizontal",
  marginY: "marginVertical",
};

function toCamelCase(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function rnKeyFor(propKey: string, cssProps: readonly string[]): keyof ViewStyle {
  // cssProps always has at least one entry (atomicConfig.mjs's own
  // invariant — every prop config declares a real CSS property).
  return RN_KEY_OVERRIDES[propKey] ?? (toCamelCase(cssProps[0] ?? propKey) as keyof ViewStyle);
}

function warnIfUnsupported(prop: string, value: unknown): void {
  if (!__DEV__) return;
  console.warn(
    `@farmsapp/design-system: Box.native received ${prop}="${String(value)}", which has no React Native equivalent. Ignored.`,
  );
}

type NativeValue<T> = T extends Responsive<infer U> | undefined ? U : T;
type PickNative<K extends keyof BoxOwnProps> = { [P in K]?: NativeValue<BoxOwnProps[P]> };

export type BoxNativeOwnProps = PickNative<
  | "padding"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingX"
  | "paddingY"
  | "margin"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft"
  | "marginX"
  | "marginY"
  | "gap"
  | "rowGap"
  | "columnGap"
  | "flexDirection"
  | "flexWrap"
  | "alignItems"
  | "justifyContent"
  | "borderColor"
  | "borderRadius"
  | "borderWidth"
> & {
  /** Only "flex"/"none" are real React Native values — see scope note above. */
  display?: "flex" | "none";
  /** "overlay" unsupported on native — see scope note above. */
  backgroundColor?: Exclude<SurfaceColor, "overlay">;
  children?: ReactNode;
};

type MutableViewStyle = { -readonly [K in keyof ViewStyle]: ViewStyle[K] };
type ViewRef = ElementRef<typeof View>;

/** Resolves any Box prop to its RN style entry, driven entirely by
 * atomicConfig.mjs — the same config Box.tsx/generate-atomic-css.mjs
 * already use for web, so a prop added there is automatically supported
 * here too (once its token category has a native value table above). */
/** Exported for other `*.native.tsx` primitives (e.g. `BaseButton.native`)
 * that need Box's own margin/layout resolution on a non-`View` root element
 * (a `Pressable`, in Button's case) without re-wrapping in an actual nested
 * `Box` — reuses the same atomicConfig.mjs-driven resolution Box.native
 * itself uses, rather than a second hand-written resolver. */
export function resolveNativeStyle(props: Record<string, unknown>): MutableViewStyle {
  const style: MutableViewStyle = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;

    const spaceCfg = SPACE_PROPS[key as keyof typeof SPACE_PROPS];
    if (spaceCfg) {
      const rnKey = rnKeyFor(key, spaceCfg.cssProps);
      (style as Record<string, unknown>)[rnKey] = value === "auto" ? "auto" : SPACE_VALUES[value as string];
      continue;
    }

    const keywordCfg = KEYWORD_PROPS[key as keyof typeof KEYWORD_PROPS];
    if (keywordCfg) {
      const rnKey = rnKeyFor(key, keywordCfg.cssProps);
      if (key === "display" && value !== "flex" && value !== "none") {
        if (process.env.NODE_ENV !== "production") warnIfUnsupported(key, value);
        continue;
      }
      const resolved = Array.isArray(keywordCfg.values)
        ? value
        : (keywordCfg.values as Record<string, string>)[value as string];
      (style as Record<string, unknown>)[rnKey] = resolved;
      continue;
    }

    const colorCfg = TOKEN_COLOR_PROPS[key as keyof typeof TOKEN_COLOR_PROPS];
    if (colorCfg) {
      const rnKey = rnKeyFor(key, colorCfg.cssProps);
      const resolved = TOKEN_VALUES[colorCfg.varCategory]?.[value as string];
      if (resolved !== undefined) (style as Record<string, unknown>)[rnKey] = resolved;
      else if (process.env.NODE_ENV !== "production") warnIfUnsupported(key, value);
      continue;
    }

    const scaleCfg = TOKEN_SCALE_PROPS[key as keyof typeof TOKEN_SCALE_PROPS];
    if (scaleCfg) {
      const rnKey = rnKeyFor(key, scaleCfg.cssProps);
      (style as Record<string, unknown>)[rnKey] = TOKEN_VALUES[scaleCfg.varCategory]?.[value as string];
      continue;
    }
  }

  return style;
}

const BoxNativeImpl = forwardRef<ViewRef, BoxNativeOwnProps>(function Box({ children, ...props }, ref) {
  const style = resolveNativeStyle(props);
  return (
    <View ref={ref} style={style as ViewStyle}>
      {children}
    </View>
  );
});

export const Box = BoxNativeImpl as (props: BoxNativeOwnProps & { ref?: Ref<ViewRef> }) => ReactElement | null;
