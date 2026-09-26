# @farmsapp/tokens

## 0.2.0

### Minor Changes

- 6b39ad0: Add the `--ds-z-index-bottom-sheet` token (250), between `overlay` and `modal`, so a Modal opened over a bottom sheet still stacks above it.
- e66367f: Add SideNav (SideNav, SideNavHeader, SideNavBody, SideNavFooter, SideNavSection, SideNavLink, SideNavLevel, SideNavItem) — a desktop rail with up to three navigation levels (L1 the rail, L2 a panel opened by a level-1 SideNavLink wrapping a SideNavLevel, L3 an inline accordion) and a mobile drawer with a Back button, ported from Blade's real collapse/hover state machine and timings. The nav's width depends only on `isExpanded`; opening a level never changes it — a level-1 item collapses L1 to the icon rail and its content shares the same box, and hovering the rail widens it back over the panel. `SideNavHeader` spans the full width and stays put while a level is open. `SideNavSection` supports a `maxVisibleItems` "+N More" overflow. Adds `@farmsapp/design-system`'s `useMediaQuery` util and `@farmsapp/tokens`' `layout.sideNav` width tokens.

## 0.1.0

### Minor Changes

- 1248912: Initial release: design tokens, utility hooks, icons, and core component library (Box, Input, Button, Badge, Divider and more)
