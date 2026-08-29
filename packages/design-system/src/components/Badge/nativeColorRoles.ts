import {
  ColorFeedbackSuccess,
  ColorFeedbackWarning,
  ColorFeedbackDanger,
  ColorFeedbackSuccessSubtle,
  ColorFeedbackWarningSubtle,
  ColorFeedbackDangerSubtle,
  ColorTextSuccess,
  ColorTextWarning,
  ColorTextDanger,
  ColorTextInverse,
} from "@farmsapp/tokens";

/**
 * Maps `resolveBadgeTokens`'s role names to real, resolved color values —
 * needed only on native, since React Native has no CSS and can't read
 * `var(--ds-color-*)` custom properties the way web does. Web never needs
 * this: `badge.css` already references the CSS vars directly.
 *
 * Light-mode values only, deliberately — `@farmsapp/tokens` only exports
 * light-mode semantic constants as flat TS values today (confirmed
 * directly: no `*Dark` semantic exports exist, only primitive `*Dark`
 * scales). Native dark-mode/brand theming is a real, separate, deferred
 * problem — see project memory "React Native future support" — this first
 * native Badge slice deliberately renders light-mode-only.
 */
export const NATIVE_COLOR_ROLES: Record<string, string> = {
  "feedback-success": ColorFeedbackSuccess,
  "feedback-warning": ColorFeedbackWarning,
  "feedback-danger": ColorFeedbackDanger,
  "feedback-success-subtle": ColorFeedbackSuccessSubtle,
  "feedback-warning-subtle": ColorFeedbackWarningSubtle,
  "feedback-danger-subtle": ColorFeedbackDangerSubtle,
  "text-success": ColorTextSuccess,
  "text-warning": ColorTextWarning,
  "text-danger": ColorTextDanger,
  "text-inverse": ColorTextInverse,
};
