# @farmsapp/design-system

## 0.2.0

### Minor Changes

- c8fa8bc: Add Modal component (Modal, ModalHeader, ModalBody, ModalFooter) — controlled dialog with scroll-locked backdrop, focus trap, Escape/backdrop/close-button dismissal gated by a single `isDismissible` flag, four sizes (small/medium/large/full), and an automatic floating close button when no ModalHeader is present.

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
