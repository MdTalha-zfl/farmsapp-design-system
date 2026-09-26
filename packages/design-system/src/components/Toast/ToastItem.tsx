import type { AnimationEvent } from "react";
import { AlertCircleIcon, CheckIcon, InfoIcon, XIcon, type IconOwnProps } from "@farmsapp/icons";
import type { ComponentType } from "react";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";
import { toastStore, type ToastEntry, type ToastIntent } from "./toastStore";

/** Neutral has no default icon (it is the plain, unaccented case); every
 * other intent — including info, which used to look identical to neutral —
 * gets one, so scanning a stack of toasts doesn't require reading each one's
 * text. Pass `icon` to override, or `null` to remove it (e.g. for neutral's
 * lack of one). */
const DEFAULT_ICON: Record<ToastIntent, ComponentType<IconOwnProps> | null> = {
  neutral: null,
  info: InfoIcon,
  success: CheckIcon,
  warning: AlertCircleIcon,
  danger: AlertCircleIcon,
};

export interface ToastItemProps {
  entry: ToastEntry;
  dismissLabel: string;
}

export function ToastItem({ entry, dismissLabel }: ToastItemProps) {
  const {
    id,
    state,
    intent = "neutral",
    title,
    description,
    icon,
    action,
    dismissible = true,
  } = entry;

  const Icon = icon === undefined ? DEFAULT_ICON[intent] : icon;
  // Every signal intent is now a strong, solid background (see toast.css);
  // only neutral (no signal) keeps the default text color. Spread in rather
  // than passed as `color={undefined}` — exactOptionalPropertyTypes rejects
  // an explicit undefined for a required-when-present prop like this.
  const textColorProp = intent === "neutral" ? {} : ({ color: "inverse" } as const);

  // The exit animation is pure CSS; this hook only tells the store it can
  // drop the entry. The store also has a timer fallback, so a missing
  // animationend (reduced motion, hidden tab) can't strand a closing toast.
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && state === "closing") {
      toastStore.remove(id);
    }
  };

  // React 18's types don't know `inert`, so it goes in as a plain attribute.
  // A closing toast is on its way out: it must not be focusable or
  // clickable, and screen readers should skip it.
  const inertProps = state === "closing" ? ({ inert: "" } as Record<string, string>) : undefined;

  return (
    <div
      className="ds-toast"
      data-toast-id={id}
      data-intent={intent}
      data-state={state}
      onAnimationEnd={handleAnimationEnd}
      {...inertProps}
    >
      {Icon ? (
        <span className="ds-toast__icon">
          {/* No `color` prop: the icon inherits --ds-toast-text via
             currentColor, so its color always matches the intent's
             background without a separate lookup table. */}
          <Icon size="medium" aria-hidden />
        </span>
      ) : null}
      <div className="ds-toast__body">
        {title ? (
          <Text size="small" weight="semibold" {...textColorProp}>
            {title}
          </Text>
        ) : null}
        <Text size="small" {...textColorProp}>
          {description}
        </Text>
        {action ? (
          <div className="ds-toast__action">
            <Button
              variant="tertiary"
              size="xsmall"
              onClick={() => {
                action.onPress({ id });
                if (action.closeOnPress !== false) toastStore.dismiss(id, "action");
              }}
            >
              {action.label}
            </Button>
          </div>
        ) : null}
      </div>
      {dismissible ? (
        <IconButton
          className="ds-toast__close"
          icon={XIcon}
          size="small"
          accessibilityLabel={dismissLabel}
          onClick={() => toastStore.dismiss(id, "user")}
        />
      ) : null}
    </div>
  );
}
