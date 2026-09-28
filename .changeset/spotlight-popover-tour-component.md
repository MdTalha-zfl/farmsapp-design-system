---
"@farmsapp/design-system": minor
"@farmsapp/tokens": minor
---

Add SpotlightPopoverTour — a spotlighted, step-by-step walkthrough component for two distinct uses: guided onboarding over a page (multi-step, `SpotlightPopoverTourFooter` helper for the standard nav row) and pointing at exactly one invalid field after a failed form submit (single-step, no separate visual variant — the red border/helper text is entirely the target `Input`'s own error state). `SpotlightPopoverTour` wraps the page/section as a context provider; `SpotlightPopoverTourStep` marks a target by cloning its child and registering a ref, the same approach Blade's real SpotlightPopoverTour uses so it stays portable to a future React Native build (no `id`/`querySelector` there). Fully controlled (`isOpen`/`activeStep`, no uncontrolled mode) since the driving use case (form validation state) already owns that state.

The spotlight cutout (an SVG mask) adopts the target's own border-radius, resyncs on the target's resize/scroll (not just on step change — closes a gap found in Blade's own implementation, relevant here since an `Input` entering its error state can grow), and scrolls the target into view if it's off-screen. The popover card reuses `Popover`'s own `PopoverContent`, `FloatingArrow`, and floating-ui wiring, but with a non-modal focus manager (`modal={false}`) — deliberately different from `Popover`/`Modal`'s modal trap, since the spotlighted target lives outside the card's own DOM and a modal trap would otherwise pull focus back into the card instead of letting the user reach the very field SpotlightPopoverTour just pointed at. Escape closes the tour; a visually-hidden `aria-live` region announces step changes — both gaps found (and left unfixed) in Blade's own SpotlightPopoverTour.

New token: `--ds-z-index-tour` (460, between `popover` and `tooltip`).
