/**
 * Derives the stable, predictable ids a form field's label/hint text need
 * for `for`/`aria-describedby` wiring — all derived from the field's own
 * `id` so two mounts of the same field never collide and the ids stay
 * stable across re-renders (unlike `useId()`, which is fine for internal
 * React reconciliation but not guaranteed to match between server and a
 * caller's own `htmlFor` expectations if they ever need to reference it
 * directly).
 */
export interface FormIds {
  labelId: string;
  helpTextId: string;
  errorTextId: string;
  successTextId: string;
}

export function useFormId(id: string): FormIds {
  return {
    labelId: `${id}-label`,
    helpTextId: `${id}-help-text`,
    errorTextId: `${id}-error-text`,
    successTextId: `${id}-success-text`,
  };
}
