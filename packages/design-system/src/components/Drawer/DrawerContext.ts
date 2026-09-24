import { createContext, useContext, type Ref } from "react";

export interface DrawerContextValue {
  /** Dismisses just this drawer. */
  close: () => void;
  /** Dismisses every open drawer (the header's close button, when stacked). */
  closeAll: () => void;
  isDismissible: boolean;
  defaultInitialFocusRef: Ref<HTMLButtonElement>;
  titleId: string;
  /** 1 for the first open drawer, 2 for the one opened over it, and so on. */
  level: number;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * Dev-mode warn-and-degrade (not throw) on misuse, matching ModalContext and
 * BottomSheetContext.
 */
export function useDrawerContext(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: DrawerHeader/DrawerBody/DrawerFooter must be rendered inside a Drawer. " +
          "Falling back to an inert stub — the close button and title wiring will not work.",
      );
    }
    return {
      close: () => {},
      closeAll: () => {},
      isDismissible: true,
      defaultInitialFocusRef: { current: null },
      titleId: "",
      level: 1,
    };
  }
  return context;
}

export const DrawerContextProvider = DrawerContext.Provider;
