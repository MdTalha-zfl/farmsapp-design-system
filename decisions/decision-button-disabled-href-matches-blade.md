# Button disabled semantics match Blade exactly — no `aria-disabled` addition on links

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Button, a real bug caught by verification and corrected against Blade's real source

## Context

Blade's real `BaseButton` formula, confirmed directly from Blade's pasted source this session:

```ts
const disabled = buttonGroupProps.isDisabled || isLoading || (isDisabled && !isLink);
```

`isDisabled` is deliberately ignored whenever `href` is set — a link-rendered button can't be made truly disabled without breaking link semantics (no HTML mechanism disables an `<a>`). Blade's own real code has no extra JS-side guard beyond passing `disabled` as a prop to a styled anchor, which has no HTML effect there — a real, confirmed limitation in Blade itself.

**A first implementation of this project's own `BaseButton` went beyond Blade** without fully committing to it: it added `aria-disabled="true"` on the link branch whenever `isDisabled` was true, while leaving the click handler (`onClick: disabled ? undefined : onClick`) still attached whenever the narrower `disabled` variable was `false` — which it always was for a plain `isDisabled` link, since that variable already excludes `isDisabled` for links. The result: a link labeled as disabled to assistive tech that was still fully clickable and would still navigate for every user. This is incoherent, not just a harmless addition beyond Blade.

**This is exactly what broke a real verification pass**: a Playwright script's `force: true` click on the "disabled" link (needed because Playwright's own actionability checks correctly refused a normal click against `aria-disabled="true"`, treating it as not-enabled) triggered a genuine browser navigation to `example.com`, since nothing actually prevented it — stalling every subsequent locator in that script. Caught by the test hanging/erroring, not assumed away.

## Decision

**Removed the `aria-disabled` addition. `onClick` is now passed through unconditionally** (matching Blade's real `BaseButton` exactly — it never does `disabled ? undefined : onClick`; blocking relies entirely on the native `disabled` HTML attribute doing its normal browser-level job for `<button>`). For `<a>`, `isDisabled` is genuinely ignored, matching Blade's real, confirmed (if imperfect) behavior — not something this project silently "fixes" beyond Blade, since the directive for this component was to strictly follow Blade's architecture.

The `apps/playground` demo was updated to be honest about this: `isDisabled + href` is now labeled as "still opens" rather than implying it's blocked.

## Consequences

- Real HTML `disabled` attribute only ever applies to `<button>`; a link never carries `disabled` or `aria-disabled` from `isDisabled` alone.
- `isLoading` still applies to `disabled` regardless of `isLink` (matches Blade's formula), so a loading link-button does get `disabled: true` passed as a prop — but since that has no HTML effect on `<a>`, and `onClick` isn't gated on it, a loading link-button is *not* actually prevented from being clicked/navigated in this project either, matching Blade's own real gap exactly rather than inventing a partial fix for only one of the two disabled paths.
- Verified in a real browser: the disabled `<button>` case is genuinely unclickable (`pointer-events: none`, real `disabled` attribute, no click handler fires); the `isDisabled` + `href` case has no `disabled` attribute and no `aria-disabled`, stays keyboard-focusable (`tabIndex: 0`), and was not click-tested further since a real click is expected, correct navigation, not a bug to route around.
