import type { ReactElement } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Space1, Space2, Space3, Space4, Space5, Space6, RadiusSm } from "@farmsapp/tokens";
import type { BadgeOwnProps, BadgeColor, BadgeEmphasis, BadgeSize } from "./Badge";
import { resolveBadgeTokens } from "./resolveBadgeTokens";
import { NATIVE_COLOR_ROLES } from "./nativeColorRoles";

export type { BadgeColor, BadgeEmphasis, BadgeSize };
export type BadgeNativeProps = Omit<BadgeOwnProps, "icon" | "shape" | "className">;

/**
 * Badge.native — React Native counterpart to the web `Badge`. First slice
 * of real cross-platform support for this design system (chunk 1, Badge
 * only — see project memory "React Native future support"). Metro resolves
 * `./Badge/Badge` to this file automatically for native builds via its
 * `X.native.tsx` filename convention; a plain web bundler never sees or
 * resolves this file.
 *
 * Deliberately reduced scope for this first slice, each a disclosed,
 * temporary cut, not an oversight:
 * - No `icon` prop — `@farmsapp/icons` only has web SVG components today;
 *   a React Native icon pipeline (react-native-svg-based) doesn't exist
 *   yet. Text-only Badge for now.
 * - No `shape` prop — always renders the "square" (radius.sm) look; a
 *   `rounded` pill variant is trivial to add once this slice is verified,
 *   left out to keep the first cross-platform proof minimal.
 * - Light-mode colors only — `@farmsapp/tokens` only exports light-mode
 *   semantic values as flat JS constants today; native dark-mode/brand
 *   theming needs its own design (no CSS cascade on native), a real,
 *   separate, deferred problem, not solved here.
 * - No margin-props passthrough — `decisions/decision-margin-props-shared-across-components.md`'s
 *   mechanism (`resolveBoxClassNames`) is web-only (produces class name
 *   strings); a native equivalent needs its own resolver, not built yet.
 */

const SIZE_PADDING: Record<NonNullable<BadgeOwnProps["size"]>, { x: number; gap: number; fontSize: number }> = {
  small: { x: Space2, gap: Space1, fontSize: 12 },
  medium: { x: Space2, gap: Space2, fontSize: 13 },
  large: { x: Space3, gap: Space2, fontSize: 13 },
};

const SIZE_HEIGHT: Record<NonNullable<BadgeOwnProps["size"]>, number> = {
  small: Space4,
  medium: Space5,
  large: Space6,
};

function warnIfEmptyChildren(children: string): void {
  if (!__DEV__) return;
  if (!children || children.trim().length === 0) {
    console.warn(
      "@farmsapp/design-system: Badge received empty/whitespace-only children — " +
        "Badge always requires visible text, there is no icon-only Badge. Rendering an empty badge.",
    );
  }
}

export function Badge({ color, emphasis = "subtle", size = "medium", children }: BadgeNativeProps): ReactElement {
  if (__DEV__) warnIfEmptyChildren(children);
  const hasText = Boolean(children) && children.trim().length > 0;

  const { backgroundColorRole, textColorRole } = resolveBadgeTokens(color, emphasis);
  const backgroundColor = NATIVE_COLOR_ROLES[backgroundColorRole];
  const textColor = NATIVE_COLOR_ROLES[textColorRole];
  const { x, gap, fontSize } = SIZE_PADDING[size];
  const height = SIZE_HEIGHT[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingHorizontal: x,
          minHeight: height,
          borderRadius: RadiusSm,
        },
      ]}
    >
      {hasText ? (
        <Text
          numberOfLines={1}
          style={{
            color: textColor,
            fontSize,
            fontWeight: emphasis === "intense" ? "400" : "500",
            marginHorizontal: gap,
          }}
        >
          {children}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});
