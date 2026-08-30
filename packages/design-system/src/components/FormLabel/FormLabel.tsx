import type { ReactElement, ReactNode } from "react";
import { Text } from "../Text/Text";
import { Inline } from "../Inline/Inline";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";

export type FormLabelPosition = "top" | "left";
export type FormLabelNecessityIndicator = "required" | "optional" | "none";
export type FormLabelSize = "xsmall" | "small" | "medium" | "large";

export interface FormLabelProps {
  id?: string;
  htmlFor?: string;
  /** Defaults to "top" — "left" only ever makes sense at desktop widths;
   * this component renders the class, the caller's layout/breakpoint
   * decides when "left" actually takes visual effect (see formLabel.css). */
  position?: FormLabelPosition;
  /** Defaults to "none". */
  necessityIndicator?: FormLabelNecessityIndicator;
  /** Defaults to "medium". */
  size?: FormLabelSize;
  labelSuffix?: ReactNode;
  labelTrailing?: ReactNode;
  /** Visually-hidden text appended after the visible label, for screen
   * readers only (e.g. extra disambiguating context a sighted user doesn't
   * need because it's obvious from surrounding layout). */
  accessibilityText?: string;
  children: ReactNode;
}

const SIZE_TO_TEXT_SIZE: Record<FormLabelSize, "xsmall" | "small" | "medium" | "large"> = {
  xsmall: "xsmall",
  small: "small",
  medium: "medium",
  large: "large",
};

export function FormLabel({
  id,
  htmlFor,
  position = "top",
  necessityIndicator = "none",
  size = "medium",
  labelSuffix,
  labelTrailing,
  accessibilityText,
  children,
}: FormLabelProps): ReactElement {
  return (
    <Inline
      as="span"
      className={`ds-form-label-row ds-form-label-row--position-${position}`}
      alignItems="center"
      justifyContent={labelTrailing ? "between" : "start"}
      gap="1"
    >
      <label id={id} htmlFor={htmlFor} className="ds-form-label">
        <Text as="span" variant="body" size={SIZE_TO_TEXT_SIZE[size]} weight="medium">
          {children}
        </Text>
        {necessityIndicator === "required" ? (
          <Text as="span" variant="body" size={SIZE_TO_TEXT_SIZE[size]} weight="medium" color="danger" className="ds-form-label__necessity">
            {" *"}
          </Text>
        ) : null}
        {necessityIndicator === "optional" ? (
          <Text as="span" variant="caption" size="xsmall" color="secondary" className="ds-form-label__necessity">
            {" (optional)"}
          </Text>
        ) : null}
        {labelSuffix ? <span className="ds-form-label__suffix">{labelSuffix}</span> : null}
        {accessibilityText ? <VisuallyHidden>{accessibilityText}</VisuallyHidden> : null}
      </label>
      {labelTrailing ? <span className="ds-form-label__trailing">{labelTrailing}</span> : null}
    </Inline>
  );
}
