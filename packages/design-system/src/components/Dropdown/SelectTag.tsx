import type { MouseEvent } from "react";
import { XIcon } from "@farmsapp/icons";

interface SelectTagProps {
  title: string;
  isDisabled: boolean;
  onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** One chosen value in a multiple select's field, with its own remove button.
 * Private to SelectInput: promote to a public Tag only if a second use
 * appears. */
export function SelectTag({ title, isDisabled, onRemove }: SelectTagProps) {
  return (
    <span className="ds-select-tag">
      <span className="ds-select-tag__text">{title}</span>
      <button
        type="button"
        className="ds-select-tag__remove"
        aria-label={`Remove ${title}`}
        disabled={isDisabled}
        onClick={onRemove}
      >
        <XIcon size="small" />
      </button>
    </span>
  );
}
