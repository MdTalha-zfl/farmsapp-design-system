---
"@farmsapp/design-system": minor
"@farmsapp/icons": minor
---

Add CounterInput (now at `components/Input/CounterInput`, alongside the other Input family members) — a numeric stepper with a `−` button, an editable integer field, and a `+` button. Typing is a draft, parsed and clamped to `[min, max]` on blur or Enter; an empty field is a real `null` state, not `min`. The buttons and arrow keys step by `step`, PageUp/PageDown by `pageStep`, and Home/End jump to the bounds. Adds `PlusIcon` to `@farmsapp/icons` for its `+` button.
