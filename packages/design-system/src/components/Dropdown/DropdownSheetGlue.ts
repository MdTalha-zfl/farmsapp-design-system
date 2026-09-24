import { createContext, useContext, type MutableRefObject } from "react";

/**
 * What a Dropdown tells a BottomSheet rendered inside it (in place of a
 * DropdownOverlay), so the sheet can take its open state from the Dropdown and
 * the Dropdown can switch to the focus model a modal sheet needs. Its own file,
 * imported by both, so BottomSheet and Dropdown never import each other.
 */
export interface DropdownSheetGlue {
  isOpen: boolean;
  close: () => void;
  /** An AutoComplete's typing box lives on the page, which a modal sheet
   * makes inert — so the sheet declines and the normal overlay is used. */
  isTypeable: boolean;
  /** Called while a sheet is mounted; the Dropdown then uses roving focus and
   * ignores its own outside-press dismissal (the sheet handles both). */
  registerSheet: () => () => void;
  /** The option to focus when the sheet opens; the list keeps it current. */
  initialFocusRef: MutableRefObject<HTMLElement | null>;
}

export const DropdownSheetGlueContext = createContext<DropdownSheetGlue | null>(null);

/** Null outside a Dropdown, so a BottomSheet stays usable on its own. */
export function useDropdownSheetGlue(): DropdownSheetGlue | null {
  return useContext(DropdownSheetGlueContext);
}
