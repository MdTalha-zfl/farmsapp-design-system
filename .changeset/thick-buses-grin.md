---
"@farmsapp/design-system": minor
"@farmsapp/tokens": minor
---

Add SideNav (SideNav, SideNavHeader, SideNavBody, SideNavFooter, SideNavSection, SideNavLink, SideNavLevel, SideNavItem) — a desktop rail with up to three navigation levels (L1 the rail, L2 a panel opened by a level-1 SideNavLink wrapping a SideNavLevel, L3 an inline accordion) and a mobile drawer with a Back button, ported from Blade's real collapse/hover state machine and timings. The nav's width depends only on `isExpanded`; opening a level never changes it — a level-1 item collapses L1 to the icon rail and its content shares the same box, and hovering the rail widens it back over the panel. `SideNavHeader` spans the full width and stays put while a level is open. `SideNavSection` supports a `maxVisibleItems` "+N More" overflow. Adds `@farmsapp/design-system`'s `useMediaQuery` util and `@farmsapp/tokens`' `layout.sideNav` width tokens.
