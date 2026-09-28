import type { ReactNode } from "react";
import { CheckIcon } from "@farmsapp/icons";
import { Text } from "../Text/Text";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";
import { useStepperItemContext, type StepperColor, type StepperItemStatus } from "./StepperContext";

export interface StepperItemProps {
  status: StepperItemStatus;
  title: ReactNode;
  /** Shown beside the title (vertical) or under it (horizontal). Pass it
   * pre-formatted — the Stepper doesn't format dates, so locale and format
   * stay the app's call. */
  timestamp?: ReactNode;
  /** Colors a reached step's marker, and the connector leading into it.
   * Defaults to "primary" (the brand color); e.g. "danger" for a cancelled
   * or returned order. */
  color?: StepperColor;
  /** Sub-events under the step, usually `StepperItemDetail`s. Shown only
   * while the layout is vertical — a horizontal bar has no room, so they're
   * hidden (from assistive tech too) at breakpoints where it's horizontal. */
  children?: ReactNode;
}

const STATUS_LABEL: Record<StepperItemStatus, string> = {
  completed: "completed",
  current: "current step",
  upcoming: "not started",
};

export function StepperItem({ status, title, timestamp, color = "primary", children }: StepperItemProps) {
  const { stepper, position } = useStepperItemContext();
  const { indicator } = stepper;
  const { index, isLast, isNextReached, nextColor } = position;

  const classes = [
    "ds-stepper__item",
    `ds-stepper__item--${status}`,
    `ds-stepper__accent-${color}`,
    isLast && "ds-stepper__item--last",
  ]
    .filter(Boolean)
    .join(" ");

  const connectorClasses = [
    "ds-stepper__connector",
    isNextReached && "ds-stepper__connector--reached",
    `ds-stepper__accent-${nextColor}`,
  ]
    .filter(Boolean)
    .join(" ");

  const markerContent =
    status === "completed" ? (
      <CheckIcon size="small" aria-hidden="true" />
    ) : indicator === "number" ? (
      <Text as="span" variant="body" size="small" weight="semibold" aria-hidden="true">
        {index + 1}
      </Text>
    ) : null;

  const hasDetails = children !== undefined && children !== null && children !== false;

  return (
    <li className={classes} aria-current={status === "current" ? "step" : undefined}>
      <div className="ds-stepper__rail">
        <span className="ds-stepper__marker">{markerContent}</span>
        {isLast ? null : <span className={connectorClasses} aria-hidden="true" />}
      </div>
      <div className="ds-stepper__content">
        <div className="ds-stepper__heading">
          {/* Size/weight here are only the pre-CSS fallback: stepper.css sets
              the real ones per orientation bundle, since orientation can
              change by breakpoint. */}
          <Text as="span" variant="body" size="large" weight="semibold" className="ds-stepper__title">
            {title}
            <VisuallyHidden>, {STATUS_LABEL[status]}</VisuallyHidden>
          </Text>
          {timestamp ? (
            <Text as="span" variant="body" size="small" color="secondary" className="ds-stepper__timestamp">
              {timestamp}
            </Text>
          ) : null}
        </div>
        {hasDetails ? <div className="ds-stepper__details">{children}</div> : null}
      </div>
    </li>
  );
}
