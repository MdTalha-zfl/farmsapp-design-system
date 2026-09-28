---
"@farmsapp/design-system": minor
---

Add Shaker, Pulser and Shimmer — three purely visual "look here" attention cues, each wrapping any element in a `<span>` (or a custom `as`) and toggling a class, never cloning or restyling the child, never intercepting clicks or changing the child's layout box.

- **Shaker** — a slow, smooth, continuously looping wiggle (`shake`, `intensity`: `subtle`/`medium`/`strong`). For an idle "Add to cart" CTA, a cart icon while something sits unaddressed in it, a "Place order" button.
- **Pulser** — a double zoom-in/zoom-out pulse with a hold between cycles (`pulse`, `intensity`). For an idle CTA, a badge that just gained a count, a price that just dropped.
- **Shimmer** — a diagonal band of light sweeping across the content (`shimmer`, `speed`: `slow`/`medium`/`fast`). For an idle "Add to cart" or "Place order" CTA.

All three animate `transform`/opacity only (no reflow), and are inert (no looping animation) while stopped.
