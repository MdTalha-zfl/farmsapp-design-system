---
"@farmsapp/design-system": minor
---

Add RollingDigits — a single-value display where each 0-9 character animates like an odometer when `value` changes; currency symbols, separators and other punctuation render as static text alongside the rolling digits, unanimated. `fontSize` accepts a literal length, a `var(--ds-font-size-*)` token, or a `clamp()` expression, with cell height and line spacing deriving from it automatically. Tabular/monospace digits by default, so a rolling character doesn't jitter in width as it moves.
