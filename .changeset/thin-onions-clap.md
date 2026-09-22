---
"@farmsapp/design-system": minor
---

Add Accordion component (Accordion, AccordionItem, AccordionItemHeader, AccordionItemBody) — single-expand accordion where opening one item closes the others, with `expandedIndex`/`defaultExpandedIndex`/`onExpandChange` for controlled or uncontrolled use. Two variants (`filled`/`transparent`) and two sizes (`large`/`medium`), an optional auto-numbered prefix (`showNumberPrefix`), and per-item `isDisabled` (still open-able via a controlled index). Follows the WAI-ARIA accordion pattern (`h3 > button` with `aria-expanded`/`aria-controls`), and `AccordionItemHeader`'s `trailing` slot sits outside the toggle button so it can safely hold its own interactive content (a Button, a Link) without nesting interactive elements.
