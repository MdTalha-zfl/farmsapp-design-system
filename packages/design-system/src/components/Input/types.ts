import type { ReactNode } from "react";

export type InputSize = "xsmall" | "small" | "medium" | "large";
export type ValidationState = "none" | "error" | "success";
export type NecessityIndicator = "required" | "optional" | "none";

/** Shared with FormLabel's own prop surface — every public Input component
 * picks this whole fragment rather than restating each field. */
export interface FormInputLabelProps {
  label?: string | undefined;
  /** Defaults to "top". "left" only takes visual effect at desktop widths. */
  labelPosition?: ("top" | "left") | undefined;
  /** Defaults to "none". */
  necessityIndicator?: NecessityIndicator | undefined;
  labelSuffix?: ReactNode;
  labelTrailing?: ReactNode;
}

/** Shared with FormHint's own prop surface. Priority when more than one is
 * supplied: error > success > help — enforced once, in BaseInput, not
 * repeated in every wrapper. */
export interface FormInputValidationProps {
  /** Defaults to "none". */
  validationState?: ValidationState | undefined;
  helpText?: string | undefined;
  errorText?: string | undefined;
  successText?: string | undefined;
}
