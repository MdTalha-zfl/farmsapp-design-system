---
"@farmsapp/design-system": minor
---

Add Collapsible (`Collapsible`, `CollapsibleTrigger`, `CollapsibleBody`) — a single open/close disclosure with no group semantics, unlike Accordion where opening one item closes the others: an order summary, a "show more" block, a filter section, anything that expands on its own. Controlled or uncontrolled via `isOpen`/`defaultIsOpen`/`onOpenChange`, plus `isDisabled`. `CollapsibleTrigger` takes `title`, `leading`, `trailing`, or custom children, with a stretched hit area over the whole header row. The panel animates open/closed with the same `grid-template-rows` 0fr→1fr technique as Accordion's own panel.
