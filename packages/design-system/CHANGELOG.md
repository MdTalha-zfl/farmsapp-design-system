# @farmsapp/design-system

## 0.2.0

### Minor Changes

- b4258bd: Add Toast (`<Toaster />`, `toast`, `useToast`) — an imperative toast queue with `neutral`/`info`/`success`/`warning`/`danger` intents, an optional single action, `update`-in-place by id, an `onDismiss` reason (`timeout`/`user`/`action`/`api`), at most 3 visible with the rest queued, and configurable placement (default bottom-center on phones, bottom-start from 600px). The queue is a framework-free module singleton, so `toast.show()` works outside React. Every non-neutral intent is a solid, full-strength background (no border) with inverse text and icon — `info` reuses the brand color, since there's no dedicated info hue — so each is unmistakable at a glance, including info versus neutral, which previously looked identical. Presentation is otherwise CSS-only (`transform`/`opacity`, no measured heights, so Devanagari and long strings wrap instead of clipping), with `prefers-reduced-motion` support, always-mounted `status`/`alert` live regions, and the existing `zIndex.toast` token. The countdown pauses while the pointer (mouse only, so a touch tap can't stick it) or keyboard focus is on a toast, or while the tab is hidden, and resumes with the remaining time. Escape dismisses the toast that has focus, and a closing toast is `inert`. Adds `InfoIcon` to `@farmsapp/icons`.
- fdb3d3f: Add Dropdown and ActionList (Dropdown, DropdownOverlay, DropdownButton, DropdownIconButton, DropdownHeader, DropdownFooter, SelectInput, AutoComplete; ActionList, ActionListItem, ActionListSection) — a menu and single/multiple select/autocomplete family built on floating-ui, with items self-registering instead of children-scanning, `role="menu"` with roving focus for a plain menu vs. `role="select"`/`role="combobox"` with virtual focus (`aria-activedescendant`) for a select or autocomplete, `Escape` closing only the dropdown even nested inside a Modal/Drawer/BottomSheet/Popover, a `size` middleware capping the panel to the space available, and `prefers-reduced-motion` support. `BaseInput` gains `as="button"`/`as="input"` field modes (with a tag-list slot for multiple select) to host `SelectInput`/`AutoComplete` inside the shared input chrome.
- 868d584: Add Drawer (Drawer, DrawerHeader, DrawerBody, DrawerFooter) — a right-edge panel built on floating-ui, with `isOpen`/`onDismiss` control, an optional backdrop with scroll lock and click-outside dismissal (`showOverlay`), `Escape` to dismiss (gated by `isDismissible`), a floating close button when there's no `DrawerHeader`, and `isLazy` to choose between unmounting on close (default) or staying mounted and hidden so children keep their state.
- 70d66a7: Add CounterInput (now at `components/Input/CounterInput`, alongside the other Input family members) — a numeric stepper with a `−` button, an editable integer field, and a `+` button. Typing is a draft, parsed and clamped to `[min, max]` on blur or Enter; an empty field is a real `null` state, not `min`. The buttons and arrow keys step by `step`, PageUp/PageDown by `pageStep`, and Home/End jump to the bounds. Adds `PlusIcon` to `@farmsapp/icons` for its `+` button.
- c8fa8bc: Add Modal component (Modal, ModalHeader, ModalBody, ModalFooter) — controlled dialog with scroll-locked backdrop, focus trap, Escape/backdrop/close-button dismissal gated by a single `isDismissible` flag, four sizes (small/medium/large/full), and an automatic floating close button when no ModalHeader is present.
- 0e1c6f6: Add BottomNav (BottomNav, BottomNavItem) — a full-width, edge-to-edge bottom navigation bar for 2 to 5 primary destinations, with the active item's icon shown in a filled circle and its label in bold. `BottomNavItem` renders a link when given `href` (accepting a polymorphic `as` for a router's link component) or a button otherwise, and `BottomNav` warns in development if given fewer than 2 or more than 5 items.
- 96cb016: Add Carousel and CarouselItem components for image/slide carousels.

  The carousel uses native CSS scroll-snap for swipe, trackpad, and keyboard navigation, with React only reading the current slide position and controlling navigation for arrow buttons and controlled activeIndex.

  Supports:
  Controlled and uncontrolled usage via activeIndex, defaultActiveIndex, and onChange
  Configurable aspectRatio
  imageFit with cover or contain
  Optional previous/next arrows via showArrows, disabled at the ends and RTL-aware
  Accessible role="region" and aria-roledescription="carousel" semantics

- 6b39ad0: Add BottomSheet component (BottomSheet, BottomSheetHeader, BottomSheetBody, BottomSheetFooter) — a controlled bottom sheet with ascending `snapPoints`, content-fit height, drag-to-resize and swipe-to-dismiss from the grabber/header/footer (Pointer Events, compositor-only `transform`), a keyboard-operable grabber (Arrow/Home/End), focus trap, scroll lock, Escape/backdrop/close-button dismissal gated by a single `isDismissible` flag, and `prefers-reduced-motion` support.
- 56c9b07: Add BottomBar — a `position: fixed` bar pinned to the bottom of the viewport for a screen's main actions (usually one or two full-width Buttons), with an `accessibilityLabel` naming the region for screen readers and a `zIndex` override for the sticky stacking tier.
- e66367f: Add SideNav (SideNav, SideNavHeader, SideNavBody, SideNavFooter, SideNavSection, SideNavLink, SideNavLevel, SideNavItem) — a desktop rail with up to three navigation levels (L1 the rail, L2 a panel opened by a level-1 SideNavLink wrapping a SideNavLevel, L3 an inline accordion) and a mobile drawer with a Back button, ported from Blade's real collapse/hover state machine and timings. The nav's width depends only on `isExpanded`; opening a level never changes it — a level-1 item collapses L1 to the icon rail and its content shares the same box, and hovering the rail widens it back over the panel. `SideNavHeader` spans the full width and stays put while a level is open. `SideNavSection` supports a `maxVisibleItems` "+N More" overflow. Adds `@farmsapp/design-system`'s `useMediaQuery` util and `@farmsapp/tokens`' `layout.sideNav` width tokens.
- 3f8f820: Add Accordion component (Accordion, AccordionItem, AccordionItemHeader, AccordionItemBody) — single-expand accordion where opening one item closes the others, with `expandedIndex`/`defaultExpandedIndex`/`onExpandChange` for controlled or uncontrolled use. Two variants (`filled`/`transparent`) and two sizes (`large`/`medium`), an optional auto-numbered prefix (`showNumberPrefix`), and per-item `isDisabled` (still open-able via a controlled index). Follows the WAI-ARIA accordion pattern (`h3 > button` with `aria-expanded`/`aria-controls`), and `AccordionItemHeader`'s `trailing` slot sits outside the toggle button so it can safely hold its own interactive content (a Button, a Link) without nesting interactive elements.
- fc56e00: Add Menu (Menu, MenuOverlay, MenuItem, MenuDivider, MenuHeader, MenuFooter) — a non-modal action menu built on floating-ui, sharing ActionList's item styling. A `MenuItem` as the first child of a nested `Menu` becomes that submenu's trigger with a right chevron; picking any leaf action closes every open level at once.
- 7ff2061: Add OTPInput — a one-time-code field with one box per character, backed by a single gapless string (deleting closes up the boxes after it, same as a text field). Only one box is a Tab stop, arrow keys/Home/End move between boxes, a paste or SMS autofill splits across boxes from wherever it lands, and `isMasked` shows each entered character as a bullet. Each box is flat and filled until it holds the caret, when it switches to a bordered, focused look.

### Patch Changes

- Updated dependencies [b4258bd]
- Updated dependencies [6b39ad0]
- Updated dependencies [70d66a7]
- Updated dependencies [6b39ad0]
- Updated dependencies [96cb016]
- Updated dependencies [e66367f]
  - @farmsapp/icons@0.2.0
  - @farmsapp/tokens@0.2.0

## 0.1.1

### Patch Changes

- Fix: rename internal CSS layers from `base`/`components` to `ds-base`/`ds-components` to avoid colliding with Tailwind CSS's reserved layer names, which was causing all component styles to be silently dropped in Tailwind-based consuming apps

## 0.1.0

### Minor Changes

- 1248912: Initial release: design tokens, utility hooks, icons, and core component library (Box, Input, Button, Badge, Divider and more)

### Patch Changes

- Updated dependencies [1248912]
  - @farmsapp/icons@0.1.0
  - @farmsapp/tokens@0.1.0
  - @farmsapp/utilities@0.1.0
