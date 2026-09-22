import { useCallback, useMemo, useRef, type ForwardedRef, type ReactElement } from "react";
import type { ExtendedRefs, ReferenceType } from "@floating-ui/react";
import { useControllableState } from "@farmsapp/utilities";

/** Props shared by every field that picks from a Dropdown (SelectInput,
 * AutoComplete): what is chosen, and how many values it may hold. */
export interface SingleSelectionProps {
  selectionType?: "single";
  /** Controlled selection: the chosen item's `value`. `""` clears it. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
}

export interface MultipleSelectionProps {
  /** Several values at once: the list stays open, options get checkboxes and
   * the chosen values show as removable tags. */
  selectionType: "multiple";
  /** Controlled selection: the chosen items' `value`s. */
  value?: string[];
  /** Uncontrolled initial selection. */
  defaultValue?: string[];
  /** How the tags fit in the field. "single": one row that scrolls sideways.
   * "multiple" (default): wraps, up to three rows, then scrolls. "expandable":
   * wraps and the field grows to show every tag. */
  maxRows?: "single" | "multiple" | "expandable";
}

// Joins a controlled array into one primitive, so a parent that builds a new
// array every render doesn't make the selection look like it changed.
const SEPARATOR = "\u001f";

/** Turns a fresh-every-render array into one whose identity only changes when
 * its contents do. */
export function useStableArray(array: string[] | undefined): string[] | undefined {
  const key = array === undefined ? undefined : array.join(SEPARATOR);
  return useMemo(() => (key === undefined ? undefined : key === "" ? [] : key.split(SEPARATOR)), [key]);
}

interface SelectionStateArgs {
  selectionType: "single" | "multiple" | undefined;
  value: string | string[] | undefined;
  defaultValue: string | string[] | undefined;
  name: string | undefined;
  onChange: ((args: { name: string | undefined; values: string[] }) => void) | undefined;
  /** Runs after a pick, e.g. to clear a search box. */
  onSelect?: ((value: string) => void) | undefined;
}

/** The selection itself — controlled or uncontrolled — always as an array,
 * with a `select` that replaces (single) or toggles (multiple). */
export function useSelectionState({ selectionType, value, defaultValue, name, onChange, onSelect }: SelectionStateArgs) {
  const isMultiple = selectionType === "multiple";

  const controlledValues = useStableArray(
    value === undefined ? undefined : Array.isArray(value) ? value : value === "" ? [] : [value],
  );
  const initialValues = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const [values, setValues] = useControllableState<string[]>({
    ...(controlledValues !== undefined ? { value: controlledValues } : {}),
    defaultValue: initialValues,
    onChange: (next) => onChange?.({ name, values: next }),
  });

  // Read through a ref, so an inline `onSelect` doesn't change `select`'s
  // identity every render (which would re-publish the trigger in a loop).
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const select = useCallback(
    (next: string) => {
      if (isMultiple) {
        setValues(values.includes(next) ? values.filter((item) => item !== next) : [...values, next]);
      } else if (values[0] !== next) {
        setValues([next]);
      }
      onSelectRef.current?.(next);
    },
    [isMultiple, values, setValues],
  );

  return { isMultiple, values, setValues, select };
}

/** A stable callback ref for the interactive element inside a field: it must
 * be stable, because a fresh one each render makes React detach and reattach
 * the ref every commit, and floating-ui's setPositionReference then
 * re-renders in a loop (which is why useMergeRefs, deliberately unmemoized,
 * is not used here). The panel is positioned against the whole bordered
 * field, while interactions attach to the element itself. */
export function useFieldReference<T extends HTMLElement>(
  refs: ExtendedRefs<ReferenceType>,
  forwardedRef: ForwardedRef<T>,
) {
  const elementRef = useRef<T | null>(null);
  const forwardedRefRef = useRef(forwardedRef);
  forwardedRefRef.current = forwardedRef;
  const setRef = useCallback(
    (node: T | null) => {
      elementRef.current = node;
      refs.setReference(node);
      refs.setPositionReference(node?.closest<HTMLElement>(".ds-input-row") ?? node);
      const forwarded = forwardedRefRef.current;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [refs],
  );
  return { elementRef, setRef };
}

/** Form participation: a single select renders one hidden input; a multiple
 * select renders one per value (repeated keys), not a joined string. */
export function SelectionFormInputs({
  name,
  values,
  isMultiple,
}: {
  name: string | undefined;
  values: string[];
  isMultiple: boolean;
}): ReactElement | null {
  if (!name) return null;
  if (isMultiple) {
    return (
      <>
        {values.map((item) => (
          <input key={item} type="hidden" name={name} value={item} />
        ))}
      </>
    );
  }
  return <input type="hidden" name={name} value={values[0] ?? ""} />;
}
