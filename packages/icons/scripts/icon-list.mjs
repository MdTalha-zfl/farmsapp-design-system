/**
 * The real, explicit source of truth for which icons exist — a small,
 * hand-reviewed list, not a bulk import of Lucide's full set. See
 * decisions/decision-icon-source-lucide.md and
 * decisions/decision-icon-generated-files-gitignored.md. Adding an icon is
 * a one-line addition here; the .tsx component is regenerated on every
 * build, never hand-edited.
 *
 * Covers: close/dismiss, a select/dropdown chevron, checkbox/success, an
 * async-loading spinner, Input error-state messaging, the password-
 * visibility-toggle pattern, a search affordance, and an indeterminate-
 * checkbox dash — real near-term needs (Button/Input/Checkbox), not a
 * speculative full icon set.
 */
export const ICON_LIST = [
  { lucideName: "x", componentName: "XIcon" },
  { lucideName: "chevron-down", componentName: "ChevronDownIcon" },
  { lucideName: "check", componentName: "CheckIcon" },
  { lucideName: "loader-circle", componentName: "LoaderCircleIcon" },
  { lucideName: "alert-circle", componentName: "AlertCircleIcon" },
  { lucideName: "eye", componentName: "EyeIcon" },
  { lucideName: "eye-off", componentName: "EyeOffIcon" },
  { lucideName: "search", componentName: "SearchIcon" },
  { lucideName: "minus", componentName: "MinusIcon" },
];
