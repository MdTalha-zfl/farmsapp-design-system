import { toastStore, type ToastOptions } from "./toastStore";

/**
 * The imperative API. Works anywhere (event handlers, API clients,
 * interceptors) because the queue is a module singleton, not React state.
 * A `<Toaster />` must be mounted once near the app root to render it.
 * See decisions/decision-toast-api-and-structure.md.
 */
export const toast = {
  /** Returns the toast's id. Reusing a live id replaces that toast in place. */
  show: (options: ToastOptions): string => toastStore.show(options),
  /** Merge fields into a live toast; false if it doesn't exist or is closing. */
  update: (id: string, partial: Partial<Omit<ToastOptions, "id">>): boolean =>
    toastStore.update(id, partial),
  /** No id = dismiss every toast. Reports `reason: "api"` to `onDismiss`. */
  dismiss: (id?: string): void => toastStore.dismiss(id),
  /** Remove everything immediately, without exit animations. */
  clear: (): void => toastStore.clear(),
};

export type ToastApi = typeof toast;

/** Same object as `toast`, for components that prefer a hook. It reads no
 * React state, so it never causes a re-render. */
export function useToast(): ToastApi {
  return toast;
}
