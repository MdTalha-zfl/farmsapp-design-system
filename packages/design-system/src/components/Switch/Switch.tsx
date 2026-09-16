import { useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from "react";
import { CheckIcon } from "@farmsapp/icons";
import { useControllableState, useId } from "@farmsapp/utilities";
import { Selector } from "../Selector/Selector";

/**
 * Switch — reuses the shared `Selector` primitive (`type="checkbox"`,
 * `role="switch"` layered on top via explicit `role`/`aria-checked`,
 * matching Blade's real `useCheckbox({ role: "switch", ... })` mechanism).
 * Standalone-only, no SwitchGroup (matches Blade — none exists). No
 * validation-state API at all (matches Blade's own deliberate scope). See
 * decisions/decision-switch-no-validation-state.md and
 * decisions/decision-switch-no-group-no-responsive-sizing.md.
 *
 * Label is a discriminated union, not Blade's real accessibilityLabel-only
 * API — `children` (real visible label text, no `aria-label` set) OR
 * `accessibilityLabel` (no visible text, becomes `aria-label`), matching
 * this project's own established `Button`/`BaseButton` pattern rather than
 * setting both simultaneously (an ARIA anti-pattern: `aria-label` would
 * silently override visible text as the accessible name). See
 * decisions/decision-switch-children-discriminated-union.md.
 */

export type SwitchSize = "small" | "medium";

type SwitchCommonProps = {
  isChecked?: boolean;
  defaultChecked?: boolean;
  onChange?: (state: { isChecked: boolean; event: ChangeEvent<HTMLInputElement> }) => void;
  isDisabled?: boolean;
  /** Defaults to "medium". No "large" — matches Blade's real 2-step scale. */
  size?: SwitchSize;
  name?: string;
  value?: string;
};

export type SwitchWithChildrenProps = SwitchCommonProps & {
  children: string;
  accessibilityLabel?: string;
};
export type SwitchWithoutChildrenProps = SwitchCommonProps & {
  children?: undefined;
  accessibilityLabel: string;
};

export type SwitchProps = SwitchWithChildrenProps | SwitchWithoutChildrenProps;

export function Switch({
  isChecked: controlledChecked,
  defaultChecked = false,
  onChange,
  isDisabled = false,
  size = "medium",
  name,
  value,
  children,
  accessibilityLabel,
}: SwitchProps) {
  const id = useId();
  const [isPressed, setIsPressed] = useState(false);
  const [isChecked, setIsChecked] = useControllableState<boolean>({
    ...(controlledChecked !== undefined ? { value: controlledChecked } : {}),
    defaultValue: defaultChecked,
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setIsChecked(event.target.checked);
    onChange?.({ isChecked: event.target.checked, event });
  }

  // Purely cosmetic — drives the press-and-stretch visual effect on the
  // thumb, not the toggle itself (which is native checkbox/Space behavior
  // already). Matches Blade's real handleKeyboardPressedIn/Out mechanism.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isDisabled && event.key === " ") setIsPressed(true);
  }
  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === " ") setIsPressed(false);
  }
  function handlePointerDown(_event: PointerEvent<HTMLInputElement>) {
    if (!isDisabled) setIsPressed(true);
  }
  function handlePointerUp(_event: PointerEvent<HTMLInputElement>) {
    setIsPressed(false);
  }

  const thumbClasses = [
    "ds-switch__thumb",
    isPressed && (isChecked ? "ds-switch__thumb--pressed-checked" : "ds-switch__thumb--pressed-unchecked"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Selector
      type="checkbox"
      id={id}
      isDisabled={isDisabled}
      name={name}
      value={value}
      checked={isChecked}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="switch"
      aria-checked={isChecked}
      aria-label={children ? undefined : accessibilityLabel}
      labelClassName="ds-switch__label"
      visual={
        <span className={`ds-switch__track ds-switch__track--size-${size}`}>
          <span className={thumbClasses}>
            <CheckIcon size="small" color="primary" className="ds-switch__thumb-icon" />
          </span>
        </span>
      }
    >
      {children}
    </Selector>
  );
}
