---
"@farmsapp/design-system": minor
---

Add CartQuantityStepper (renamed from an earlier CartCounter working name) and Countdown, both built on RollingDigits (also newly added here as a shared dependency).

- **RollingDigits** — a single-value display where each 0-9 character animates like an odometer when `value` changes; punctuation and currency symbols render as static text alongside the rolling digits, unanimated.
- **CartQuantityStepper** — a plain-text quantity stepper for a product card or cart line: a filled `+`/`-` square either side of the number, no bordered field, nothing editable. With `showTrashIcon`, the `-` button turns into a trash button once `value` reaches `min` instead of disabling, since on a cart line reaching the floor means "remove the line," not "stop here." The digit itself renders via `RollingDigits`.
- **Countdown** — a countdown timer (e.g. "Sale ends in") built on the same `RollingDigits` odometer digits, with an `aria-live` announcement alongside it.
