---
"@farmsapp/design-system": minor
---

Add Dropdown and ActionList (Dropdown, DropdownOverlay, DropdownButton, DropdownIconButton, DropdownHeader, DropdownFooter, SelectInput, AutoComplete; ActionList, ActionListItem, ActionListSection) — a menu and single/multiple select/autocomplete family built on floating-ui, with items self-registering instead of children-scanning, `role="menu"` with roving focus for a plain menu vs. `role="select"`/`role="combobox"` with virtual focus (`aria-activedescendant`) for a select or autocomplete, `Escape` closing only the dropdown even nested inside a Modal/Drawer/BottomSheet/Popover, a `size` middleware capping the panel to the space available, and `prefers-reduced-motion` support. `BaseInput` gains `as="button"`/`as="input"` field modes (with a tag-list slot for multiple select) to host `SelectInput`/`AutoComplete` inside the shared input chrome.
