import type { BadgeColor, BadgeEmphasis } from "./Badge";

/**
 * Platform-agnostic "which semantic role for this color+emphasis" decision
 * — the one piece of Badge's logic that genuinely needs to be shared
 * between web and native, per decisions/decision-badge-color-prop-scope-v1.md
 * and decisions/decision-badge-emphasis-reuses-existing-tokens.md's own
 * reasoning (same 3 colors, same subtle/intense -> background+text role
 * mapping). Deliberately NOT consumed by the web Badge.tsx/badge.css path —
 * web already resolves this via CSS selectors (`.ds-badge--color-success.
 * ds-badge--emphasis-subtle`), which works and is verified; forcing web to
 * route through this function instead would mean rebuilding web's styling
 * mechanism for no reason. This is a small, disclosed duplication of the
 * same mapping badge.css already encodes — the same "small, disclosed,
 * by-hand-kept-in-sync duplication" precedent already established for
 * IconColor/TextColor (decisions/decision-icon-size-color-reuse-tokens.md).
 * See project memory "React Native future support".
 */

export interface BadgeTokenRoles {
  backgroundColorRole: string;
  textColorRole: string;
}

const SUBTLE_BACKGROUND: Record<BadgeColor, string> = {
  success: "feedback-success-subtle",
  warning: "feedback-warning-subtle",
  danger: "feedback-danger-subtle",
};

const INTENSE_BACKGROUND: Record<BadgeColor, string> = {
  success: "feedback-success",
  warning: "feedback-warning",
  danger: "feedback-danger",
};

const SUBTLE_TEXT: Record<BadgeColor, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function resolveBadgeTokens(color: BadgeColor, emphasis: BadgeEmphasis): BadgeTokenRoles {
  if (emphasis === "intense") {
    return { backgroundColorRole: INTENSE_BACKGROUND[color], textColorRole: "text-inverse" };
  }
  return { backgroundColorRole: SUBTLE_BACKGROUND[color], textColorRole: SUBTLE_TEXT[color] };
}
