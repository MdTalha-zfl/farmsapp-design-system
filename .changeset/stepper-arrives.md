---
"@farmsapp/design-system": minor
---

Add Stepper (`Stepper`, `StepperItem`, `StepperItemDetail`) — a sequence of steps with their progress: an order-tracking timeline (`orientation="vertical"`, the default) or a checkout progress bar (`orientation="horizontal"`). Status (`completed`/`current`/`upcoming`) is set per item rather than derived from one `activeIndex`, since real data (an order's status history) can mark any subset of steps complete, not only a prefix. `color` on a step (`primary`/`success`/`warning`/`danger`) colors its marker and the line leading into it, e.g. red for a cancelled order. `indicator` (`icon`/`number`) controls whether a reached step shows a check/dot or a number, defaulting from the orientation. `StepperItemDetail` holds vertical-only sub-events under a step.

`orientation` also accepts `{ base, md, lg }` to switch layouts by the Stepper's own width (a container query, not a viewport one, so it works inside a narrow side panel too) — a timeline in a phone-width column that becomes a progress bar once there's room, with no JS measuring and no SSR flash.
