import type { ReactNode } from "react";
import { Text } from "../Text/Text";

export interface StepperItemDetailProps {
  title: ReactNode;
  /** Pre-formatted, e.g. "Apr 13, 2025 02:30PM". */
  timestamp?: ReactNode;
}

/** One sub-event under a vertical `StepperItem` — e.g. "Your item has been
 * packed" inside "Order Confirmed". */
export function StepperItemDetail({ title, timestamp }: StepperItemDetailProps) {
  return (
    <div className="ds-stepper__detail">
      <Text variant="body" size="medium" weight="semibold">
        {title}
      </Text>
      {timestamp ? (
        <Text variant="body" size="small" color="secondary">
          {timestamp}
        </Text>
      ) : null}
    </div>
  );
}
