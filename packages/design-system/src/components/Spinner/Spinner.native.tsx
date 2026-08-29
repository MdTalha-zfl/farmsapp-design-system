import { ActivityIndicator } from "react-native";
import { ColorTextPrimary } from "@farmsapp/tokens";
import { Box, type BoxNativeOwnProps } from "../Box/Box.native";

export type SpinnerNativeSize = "small" | "medium" | "large";

export interface SpinnerNativeProps
  extends Pick<BoxNativeOwnProps, "margin" | "marginTop" | "marginRight" | "marginBottom" | "marginLeft" | "marginX" | "marginY"> {
  /** Default "medium" — matches the web SpinnerSize scale for API parity. */
  size?: SpinnerNativeSize;
  /** Required, no default — matches the web Spinner and Blade's real BaseSpinner. */
  accessibilityLabel: string;
}

const RN_SIZE: Record<SpinnerNativeSize, "small" | "large"> = {
  small: "small",
  medium: "small",
  large: "large",
};

export function Spinner({ size = "medium", accessibilityLabel, ...marginProps }: SpinnerNativeProps) {
  return (
    <Box {...marginProps}>
      <ActivityIndicator
        size={RN_SIZE[size]}
        color={ColorTextPrimary}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityLiveRegion="polite"
      />
    </Box>
  );
}
