import type { BaseTextSizes } from "../Text/Text";
import type { BadgeSize } from "./Badge";

// No icon-size map: Badge's icon always renders at Icon's own smallest size
// ("small", 16px) regardless of Badge size — this project's Icon has nothing
// smaller to step down to for Badge's own "small", so there's no ratio to
// preserve the way Button steps its icon size. See
// decisions/decision-badge-size-scale-drops-xsmall.md.
export const badgeSizeToTextSizeMap: Record<BadgeSize, BaseTextSizes> = {
  small: "xsmall",
  medium: "small",
  large: "small",
};
