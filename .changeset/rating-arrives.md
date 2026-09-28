---
"@farmsapp/design-system": minor
---

Add Rating — a read-only star display for showing a score, e.g. a product card's average rating or a review's star line. `value` (0–`max`, fractional values allowed, e.g. 4.3) fills the stars proportionally; `max` defaults to 5. `color` (`primary`/`warning`/`success`/`danger`) sets the fill, defaulting to this design system's brand green rather than the conventional gold/amber star-rating hue — pass `"warning"` for that familiar gold look. Renders as one static element with a single "Rated X out of Y" `aria-label` rather than per-star roles, since there's nothing here for a screen-reader user to interact with — `accessibilityLabel` overrides that label, e.g. to fold in a review count ("4.3 out of 5, 128 reviews"). Adds `StarIcon` to `@farmsapp/icons`.
