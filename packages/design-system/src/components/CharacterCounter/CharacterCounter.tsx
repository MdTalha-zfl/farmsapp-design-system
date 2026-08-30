import type { ReactElement } from "react";
import { Text } from "../Text/Text";

export type CharacterCounterSize = "xsmall" | "small" | "medium" | "large";

export interface CharacterCounterProps {
  currentCount: number;
  maxCount: number;
  /** Defaults to "medium". */
  size?: CharacterCounterSize;
  /** For `aria-describedby` wiring from the field it counts characters for
   * — kept out of `aria-hidden` so that wiring stays meaningful; screen
   * readers get it announced once on focus rather than as a noisy live
   * region on every keystroke. */
  id?: string;
}

const SIZE_TO_TEXT_SIZE: Record<CharacterCounterSize, "xsmall" | "small"> = {
  xsmall: "xsmall",
  small: "xsmall",
  medium: "small",
  large: "small",
};

export function CharacterCounter({ currentCount, maxCount, size = "medium", id }: CharacterCounterProps): ReactElement {
  const isOverLimit = currentCount > maxCount;
  return (
    <Text
      as="span"
      id={id}
      variant="caption"
      size={SIZE_TO_TEXT_SIZE[size]}
      color={isOverLimit ? "danger" : "secondary"}
      textAlign="right"
    >
      {currentCount}/{maxCount}
    </Text>
  );
}
