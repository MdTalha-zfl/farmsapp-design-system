import { createContext, useContext, type HTMLAttributes, type Ref } from "react";

export type DragZoneProps = Pick<
  HTMLAttributes<HTMLElement>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>;

export interface BottomSheetContextValue {
  close: () => void;
  isDismissible: boolean;
  defaultInitialFocusRef: Ref<HTMLButtonElement>;
  titleId: string;
  dragZoneProps: DragZoneProps;
}

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

/**
 * Dev-mode warn-and-degrade (not throw) on misuse, matching ModalContext and
 * CheckboxGroupContext.
 */
export function useBottomSheetContext(): BottomSheetContextValue {
  const context = useContext(BottomSheetContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: BottomSheetHeader/BottomSheetBody/BottomSheetFooter must be rendered inside a BottomSheet. " +
          "Falling back to an inert stub — the close button, drag zones and title wiring will not work.",
      );
    }
    return {
      close: () => {},
      isDismissible: true,
      defaultInitialFocusRef: { current: null },
      titleId: "",
      dragZoneProps: {},
    };
  }
  return context;
}

export const BottomSheetContextProvider = BottomSheetContext.Provider;
