import { createContext, useContext, type Ref } from "react";

export interface ModalContextValue {
  close: () => void;
  isDismissible: boolean;
  defaultInitialFocusRef: Ref<HTMLButtonElement>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Popover has no Context — a single `content` slot needs no cross-component
 * sharing. Modal's header/body/footer split genuinely does: ModalHeader's
 * own close button needs `close`/`isDismissible`, and needs to register
 * itself as the default initial-focus target. Dev-mode warn-and-degrade
 * (not throw) on misuse, matching this project's standing convention (e.g.
 * CheckboxGroupContext).
 */
export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "@farmsapp/design-system: ModalHeader/ModalBody/ModalFooter must be rendered inside a Modal. " +
          "Falling back to an inert stub — the close button and initial-focus wiring will not work.",
      );
    }
    return {
      close: () => {},
      isDismissible: true,
      defaultInitialFocusRef: { current: null },
    };
  }
  return context;
}

export const ModalContextProvider = ModalContext.Provider;
