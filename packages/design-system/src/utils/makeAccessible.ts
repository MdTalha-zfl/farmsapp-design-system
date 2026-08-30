/**
 * Maps a normalized form-field state object to the real `aria-*`/native
 * attributes a screen reader needs — kept as one shared function so every
 * Input family member wires accessibility identically instead of each
 * public component (TextInput/PasswordInput/SearchInput/TextArea)
 * hand-rolling its own `aria-*` object and risking drift between them.
 */
export interface AccessibleFieldState {
  isRequired?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  /** Ids of whichever hint text node(s) are currently visible, in the order
   * they should be announced. Falsy entries are dropped. */
  describedByIds?: (string | undefined | false)[] | undefined;
  /** Only used when there's no visible label (or it's visually hidden). */
  accessibilityLabel?: string | undefined;
  hasPopup?: boolean | undefined;
  popupId?: string | undefined;
  isPopupExpanded?: boolean | undefined;
  activeDescendant?: string | undefined;
}

export interface AccessibleFieldAttributes {
  "aria-required"?: true;
  "aria-disabled"?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-haspopup"?: true;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-activedescendant"?: string;
}

export function makeAccessible(state: AccessibleFieldState): AccessibleFieldAttributes {
  const describedBy = (state.describedByIds ?? []).filter((id): id is string => Boolean(id)).join(" ");

  return {
    ...(state.isRequired ? { "aria-required": true as const } : {}),
    ...(state.isDisabled ? { "aria-disabled": true as const } : {}),
    ...(state.isInvalid ? { "aria-invalid": true as const } : {}),
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(state.accessibilityLabel ? { "aria-label": state.accessibilityLabel } : {}),
    ...(state.hasPopup ? { "aria-haspopup": true as const } : {}),
    ...(state.popupId ? { "aria-controls": state.popupId } : {}),
    ...(state.isPopupExpanded !== undefined ? { "aria-expanded": state.isPopupExpanded } : {}),
    ...(state.activeDescendant ? { "aria-activedescendant": state.activeDescendant } : {}),
  };
}
