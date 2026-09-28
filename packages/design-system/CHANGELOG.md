# @farmsapp/design-system

## 0.2.0

### Minor Changes

- b4258bd: Add Toast (`<Toaster />`, `toast`, `useToast`) — an imperative toast queue with `neutral`/`info`/`success`/`warning`/`danger` intents, an optional single action, `update`-in-place by id, an `onDismiss` reason (`timeout`/`user`/`action`/`api`), at most 3 visible with the rest queued, and configurable placement (default bottom-center on phones, bottom-start from 600px). The queue is a framework-free module singleton, so `toast.show()` works outside React. Every non-neutral intent is a solid, full-strength background (no border) with inverse text and icon — `info` reuses the brand color, since there's no dedicated info hue — so each is unmistakable at a glance, including info versus neutral, which previously looked identical. Presentation is otherwise CSS-only (`transform`/`opacity`, no measured heights, so Devanagari and long strings wrap instead of clipping), with `prefers-reduced-motion` support, always-mounted `status`/`alert` live regions, and the existing `zIndex.toast` token. The countdown pauses while the pointer (mouse only, so a touch tap can't stick it) or keyboard focus is on a toast, or while the tab is hidden, and resumes with the remaining time. Escape dismisses the toast that has focus, and a closing toast is `inert`. Adds `InfoIcon` to `@farmsapp/icons`.
- 6d66854: Add CartQuantityStepper (renamed from an earlier CartCounter working name) and Countdown, both built on RollingDigits (also newly added here as a shared dependency).

  - **RollingDigits** — a single-value display where each 0-9 character animates like an odometer when `value` changes; punctuation and currency symbols render as static text alongside the rolling digits, unanimated.
  - **CartQuantityStepper** — a plain-text quantity stepper for a product card or cart line: a filled `+`/`-` square either side of the number, no bordered field, nothing editable. With `showTrashIcon`, the `-` button turns into a trash button once `value` reaches `min` instead of disabling, since on a cart line reaching the floor means "remove the line," not "stop here." The digit itself renders via `RollingDigits`.
  - **Countdown** — a countdown timer (e.g. "Sale ends in") built on the same `RollingDigits` odometer digits, with an `aria-live` announcement alongside it.

- fdb3d3f: Add Dropdown and ActionList (Dropdown, DropdownOverlay, DropdownButton, DropdownIconButton, DropdownHeader, DropdownFooter, SelectInput, AutoComplete; ActionList, ActionListItem, ActionListSection) — a menu and single/multiple select/autocomplete family built on floating-ui, with items self-registering instead of children-scanning, `role="menu"` with roving focus for a plain menu vs. `role="select"`/`role="combobox"` with virtual focus (`aria-activedescendant`) for a select or autocomplete, `Escape` closing only the dropdown even nested inside a Modal/Drawer/BottomSheet/Popover, a `size` middleware capping the panel to the space available, and `prefers-reduced-motion` support. `BaseInput` gains `as="button"`/`as="input"` field modes (with a tag-list slot for multiple select) to host `SelectInput`/`AutoComplete` inside the shared input chrome.
- 868d584: Add Drawer (Drawer, DrawerHeader, DrawerBody, DrawerFooter) — a right-edge panel built on floating-ui, with `isOpen`/`onDismiss` control, an optional backdrop with scroll lock and click-outside dismissal (`showOverlay`), `Escape` to dismiss (gated by `isDismissible`), a floating close button when there's no `DrawerHeader`, and `isLazy` to choose between unmounting on close (default) or staying mounted and hidden so children keep their state.
- 70d66a7: Add CounterInput (now at `components/Input/CounterInput`, alongside the other Input family members) — a numeric stepper with a `−` button, an editable integer field, and a `+` button. Typing is a draft, parsed and clamped to `[min, max]` on blur or Enter; an empty field is a real `null` state, not `min`. The buttons and arrow keys step by `step`, PageUp/PageDown by `pageStep`, and Home/End jump to the bounds. Adds `PlusIcon` to `@farmsapp/icons` for its `+` button.
- c8fa8bc: Add Modal component (Modal, ModalHeader, ModalBody, ModalFooter) — controlled dialog with scroll-locked backdrop, focus trap, Escape/backdrop/close-button dismissal gated by a single `isDismissible` flag, four sizes (small/medium/large/full), and an automatic floating close button when no ModalHeader is present.
- 864a1b6: Add Rating — a read-only star display for showing a score, e.g. a product card's average rating or a review's star line. `value` (0–`max`, fractional values allowed, e.g. 4.3) fills the stars proportionally; `max` defaults to 5. `color` (`primary`/`warning`/`success`/`danger`) sets the fill, defaulting to this design system's brand green rather than the conventional gold/amber star-rating hue — pass `"warning"` for that familiar gold look. Renders as one static element with a single "Rated X out of Y" `aria-label` rather than per-star roles, since there's nothing here for a screen-reader user to interact with — `accessibilityLabel` overrides that label, e.g. to fold in a review count ("4.3 out of 5, 128 reviews"). Adds `StarIcon` to `@farmsapp/icons`.
- 36b6472: Add RollingDigits — a single-value display where each 0-9 character animates like an odometer when `value` changes; currency symbols, separators and other punctuation render as static text alongside the rolling digits, unanimated. `fontSize` accepts a literal length, a `var(--ds-font-size-*)` token, or a `clamp()` expression, with cell height and line spacing deriving from it automatically. Tabular/monospace digits by default, so a rolling character doesn't jitter in width as it moves.
- fb94c97: Add Shaker, Pulser and Shimmer — three purely visual "look here" attention cues, each wrapping any element in a `<span>` (or a custom `as`) and toggling a class, never cloning or restyling the child, never intercepting clicks or changing the child's layout box.

  - **Shaker** — a slow, smooth, continuously looping wiggle (`shake`, `intensity`: `subtle`/`medium`/`strong`). For an idle "Add to cart" CTA, a cart icon while something sits unaddressed in it, a "Place order" button.
  - **Pulser** — a double zoom-in/zoom-out pulse with a hold between cycles (`pulse`, `intensity`). For an idle CTA, a badge that just gained a count, a price that just dropped.
  - **Shimmer** — a diagonal band of light sweeping across the content (`shimmer`, `speed`: `slow`/`medium`/`fast`). For an idle "Add to cart" or "Place order" CTA.

  All three animate `transform`/opacity only (no reflow), and are inert (no looping animation) while stopped.

- 0e1c6f6: Add BottomNav (BottomNav, BottomNavItem) — a full-width, edge-to-edge bottom navigation bar for 2 to 5 primary destinations, with the active item's icon shown in a filled circle and its label in bold. `BottomNavItem` renders a link when given `href` (accepting a polymorphic `as` for a router's link component) or a button otherwise, and `BottomNav` warns in development if given fewer than 2 or more than 5 items.
- 549b3ae: Add Collapsible (`Collapsible`, `CollapsibleTrigger`, `CollapsibleBody`) — a single open/close disclosure with no group semantics, unlike Accordion where opening one item closes the others: an order summary, a "show more" block, a filter section, anything that expands on its own. Controlled or uncontrolled via `isOpen`/`defaultIsOpen`/`onOpenChange`, plus `isDisabled`. `CollapsibleTrigger` takes `title`, `leading`, `trailing`, or custom children, with a stretched hit area over the whole header row. The panel animates open/closed with the same `grid-template-rows` 0fr→1fr technique as Accordion's own panel.
- 96cb016: Add Carousel and CarouselItem components for image/slide carousels.

  The carousel uses native CSS scroll-snap for swipe, trackpad, and keyboard navigation, with React only reading the current slide position and controlling navigation for arrow buttons and controlled activeIndex.

  Supports:
  Controlled and uncontrolled usage via activeIndex, defaultActiveIndex, and onChange
  Configurable aspectRatio
  imageFit with cover or contain
  Optional previous/next arrows via showArrows, disabled at the ends and RTL-aware
  Accessible role="region" and aria-roledescription="carousel" semantics

- 4aced7c: Add SpotlightPopoverTour — a spotlighted, step-by-step walkthrough component for two distinct uses: guided onboarding over a page (multi-step, `SpotlightPopoverTourFooter` helper for the standard nav row) and pointing at exactly one invalid field after a failed form submit (single-step, no separate visual variant — the red border/helper text is entirely the target `Input`'s own error state). `SpotlightPopoverTour` wraps the page/section as a context provider; `SpotlightPopoverTourStep` marks a target by cloning its child and registering a ref, the same approach Blade's real SpotlightPopoverTour uses so it stays portable to a future React Native build (no `id`/`querySelector` there). Fully controlled (`isOpen`/`activeStep`, no uncontrolled mode) since the driving use case (form validation state) already owns that state.

  The spotlight cutout (an SVG mask) adopts the target's own border-radius, resyncs on the target's resize/scroll (not just on step change — closes a gap found in Blade's own implementation, relevant here since an `Input` entering its error state can grow), and scrolls the target into view if it's off-screen. The popover card reuses `Popover`'s own `PopoverContent`, `FloatingArrow`, and floating-ui wiring, but with a non-modal focus manager (`modal={false}`) — deliberately different from `Popover`/`Modal`'s modal trap, since the spotlighted target lives outside the card's own DOM and a modal trap would otherwise pull focus back into the card instead of letting the user reach the very field SpotlightPopoverTour just pointed at. Escape closes the tour; a visually-hidden `aria-live` region announces step changes — both gaps found (and left unfixed) in Blade's own SpotlightPopoverTour.

  New token: `--ds-z-index-tour` (460, between `popover` and `tooltip`).

- 6b39ad0: Add BottomSheet component (BottomSheet, BottomSheetHeader, BottomSheetBody, BottomSheetFooter) — a controlled bottom sheet with ascending `snapPoints`, content-fit height, drag-to-resize and swipe-to-dismiss from the grabber/header/footer (Pointer Events, compositor-only `transform`), a keyboard-operable grabber (Arrow/Home/End), focus trap, scroll lock, Escape/backdrop/close-button dismissal gated by a single `isDismissible` flag, and `prefers-reduced-motion` support.
- 957ed8f: Add Stepper (`Stepper`, `StepperItem`, `StepperItemDetail`) — a sequence of steps with their progress: an order-tracking timeline (`orientation="vertical"`, the default) or a checkout progress bar (`orientation="horizontal"`). Status (`completed`/`current`/`upcoming`) is set per item rather than derived from one `activeIndex`, since real data (an order's status history) can mark any subset of steps complete, not only a prefix. `color` on a step (`primary`/`success`/`warning`/`danger`) colors its marker and the line leading into it, e.g. red for a cancelled order. `indicator` (`icon`/`number`) controls whether a reached step shows a check/dot or a number, defaulting from the orientation. `StepperItemDetail` holds vertical-only sub-events under a step.

  `orientation` also accepts `{ base, md, lg }` to switch layouts by the Stepper's own width (a container query, not a viewport one, so it works inside a narrow side panel too) — a timeline in a phone-width column that becomes a progress bar once there's room, with no JS measuring and no SSR flash.

- 56c9b07: Add BottomBar — a `position: fixed` bar pinned to the bottom of the viewport for a screen's main actions (usually one or two full-width Buttons), with an `accessibilityLabel` naming the region for screen readers and a `zIndex` override for the sticky stacking tier.
- e66367f: Add SideNav (SideNav, SideNavHeader, SideNavBody, SideNavFooter, SideNavSection, SideNavLink, SideNavLevel, SideNavItem) — a desktop rail with up to three navigation levels (L1 the rail, L2 a panel opened by a level-1 SideNavLink wrapping a SideNavLevel, L3 an inline accordion) and a mobile drawer with a Back button, ported from Blade's real collapse/hover state machine and timings. The nav's width depends only on `isExpanded`; opening a level never changes it — a level-1 item collapses L1 to the icon rail and its content shares the same box, and hovering the rail widens it back over the panel. `SideNavHeader` spans the full width and stays put while a level is open. `SideNavSection` supports a `maxVisibleItems` "+N More" overflow. Adds `@farmsapp/design-system`'s `useMediaQuery` util and `@farmsapp/tokens`' `layout.sideNav` width tokens.
- 3f8f820: Add Accordion component (Accordion, AccordionItem, AccordionItemHeader, AccordionItemBody) — single-expand accordion where opening one item closes the others, with `expandedIndex`/`defaultExpandedIndex`/`onExpandChange` for controlled or uncontrolled use. Two variants (`filled`/`transparent`) and two sizes (`large`/`medium`), an optional auto-numbered prefix (`showNumberPrefix`), and per-item `isDisabled` (still open-able via a controlled index). Follows the WAI-ARIA accordion pattern (`h3 > button` with `aria-expanded`/`aria-controls`), and `AccordionItemHeader`'s `trailing` slot sits outside the toggle button so it can safely hold its own interactive content (a Button, a Link) without nesting interactive elements.
- fc56e00: Add Menu (Menu, MenuOverlay, MenuItem, MenuDivider, MenuHeader, MenuFooter) — a non-modal action menu built on floating-ui, sharing ActionList's item styling. A `MenuItem` as the first child of a nested `Menu` becomes that submenu's trigger with a right chevron; picking any leaf action closes every open level at once.
- 7ff2061: Add OTPInput — a one-time-code field with one box per character, backed by a single gapless string (deleting closes up the boxes after it, same as a text field). Only one box is a Tab stop, arrow keys/Home/End move between boxes, a paste or SMS autofill splits across boxes from wherever it lands, and `isMasked` shows each entered character as a bullet. Each box is flat and filled until it holds the caret, when it switches to a bordered, focused look.

### Patch Changes

- Updated dependencies [b4258bd]
- Updated dependencies [6b39ad0]
- Updated dependencies [70d66a7]
- Updated dependencies [4aced7c]
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
