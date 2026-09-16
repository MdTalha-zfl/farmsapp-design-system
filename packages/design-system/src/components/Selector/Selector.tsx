import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * Selector — the shared visually-hidden-`<input>` + visual-box wrapper
 * behind Checkbox (and, next, Radio/Switch), matching Blade's real
 * `Form/Selector/` structure (one shared primitive across all three real
 * selector-style inputs). See decisions/decision-checkbox-selector-shared-primitive.md.
 *
 * DOM: a real `<label>` wraps a real `<input>` positioned `absolute;
 * inset: 0; opacity: 0` directly followed by a visual-box element, then
 * the label text. This is a *different* CSS technique from
 * `VisuallyHidden` (off-screen clip, no pointer-events) — this input must
 * sit exactly on top of the visual box and still receive real clicks/
 * focus/keyboard input. See decisions/decision-checkbox-visually-hidden-input-new-technique.md.
 *
 * All visual state (checked/indeterminate/hover/focus-visible/disabled) is
 * driven by real CSS sibling selectors off the real input's own native
 * pseudo-classes (`input:checked + .ds-selector__box`, etc.) — not
 * JS-driven className toggling like Blade's styled-components closures.
 * This project has no CSS-in-JS layer, so the native input state can
 * drive styling directly. See decisions/decision-checkbox-css-pseudo-classes-not-js.md.
 */

export type SelectorSize = "small" | "medium" | "large";

export interface SelectorProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  type: "checkbox" | "radio";
  size?: SelectorSize;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The visual box/track element — Checkbox renders a square box with a
   * checkmark/dash icon; Radio (next) renders a circular box with a dot;
   * Switch (next) renders a track+thumb. Selector itself has no opinion on
   * this shape. */
  visual: ReactNode;
  /** Label text/content, rendered after the visual box inside the same
   * `<label>` — no separate `label` prop, matching Blade's real Checkbox
   * (children only). */
  children?: ReactNode;
  className?: string | undefined;
  labelClassName?: string | undefined;
}

export const Selector = forwardRef<HTMLInputElement, SelectorProps>(function Selector(
  {
    type,
    size = "medium",
    isDisabled = false,
    isInvalid = false,
    onChange,
    visual,
    children,
    className,
    labelClassName,
    ...inputProps
  },
  ref,
) {
  const labelClasses = [
    "ds-selector",
    `ds-selector--size-${size}`,
    isDisabled && "ds-selector--disabled",
    isInvalid && "ds-selector--invalid",
    labelClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={labelClasses}>
      <input
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        onChange={onChange}
        className={["ds-selector__input", className].filter(Boolean).join(" ")}
        {...inputProps}
      />
      {visual}
      {children ? <span className="ds-selector__label-text">{children}</span> : null}
    </label>
  );
});
