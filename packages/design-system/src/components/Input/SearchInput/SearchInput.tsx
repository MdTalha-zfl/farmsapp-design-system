import { forwardRef, type FocusEvent, type ReactElement, type Ref } from "react";
import { SearchIcon, XIcon } from "@farmsapp/icons";
import { BaseInput } from "../BaseInput/BaseInput";
import { IconButton } from "../../IconButton/IconButton";
import { Spinner } from "../../Spinner/Spinner";
import type { InputSize } from "../types";
import type { Radius } from "../../Box/Box";

/**
 * SearchInput — deliberately has NO validation/necessity props at all
 * (matching the spec: search fields aren't validated form fields). Reuses
 * BaseInput purely for its label/field/adornment rendering, never passes
 * `validationState`/`helpText`/`errorText`/`successText`/`isRequired`.
 */

export interface SearchInputProps {
  id: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange?: (e: { name?: string | undefined; value: string }) => void;

  isDisabled?: boolean;
  autoFocus?: boolean;

  label?: string;

  /** Defaults to true. */
  showSearchIcon?: boolean;
  isLoading?: boolean;
  showClearButton?: boolean;
  onClearButtonClick?: () => void;
  /** A nested dropdown/autocomplete-list trigger. */
  trailing?: ReactElement;

  accessibilityLabel?: string;
  hideLabelText?: boolean;

  hasPopup?: boolean;
  popupId?: string;
  isPopupExpanded?: boolean;
  activeDescendant?: string;

  size?: InputSize;
  borderRadius?: Radius;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    showSearchIcon = true,
    isLoading = false,
    showClearButton = false,
    onClearButtonClick,
    trailing,
    isDisabled,
    value,
    defaultValue,
    size = "medium",
    onChange,
    ...props
  },
  ref,
) {
  const hasValue = Boolean(value ?? defaultValue);
  const showClear = showClearButton && hasValue && !isDisabled;

  return (
    <BaseInput
      ref={ref as Ref<HTMLInputElement | HTMLTextAreaElement>}
      as="input"
      type="search"
      keyboardType="search"
      isDisabled={isDisabled}
      value={value}
      defaultValue={defaultValue}
      size={size}
      leadingIcon={showSearchIcon ? SearchIcon : undefined}
      trailingInteractionElement={
        isLoading || showClear || trailing ? (
          <>
            {isLoading ? <Spinner size={size === "large" ? "medium" : "small"} accessibilityLabel="Searching" /> : null}
            {showClear ? (
              <IconButton icon={XIcon} size="small" emphasis="subtle" accessibilityLabel="Clear search" onClick={() => onClearButtonClick?.()} />
            ) : null}
            {trailing}
          </>
        ) : undefined
      }
      onChange={(e) => onChange?.({ name: e.name, value: e.value })}
      {...props}
    />
  );
});
