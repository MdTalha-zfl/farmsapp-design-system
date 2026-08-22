# Container gets its own maxWidth scale, independent of any breakpoint tokens

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 03 — Stack, Inline, Container

## Context

This project already has three different breakpoint-shaped token sets: `consumer` and `portal` (page-layout breakpoints, deliberately different per app — Token Foundation Chunk 05), and `component` (Box's responsive style props, deliberately a third, shared, fixed scale — decision-component-breakpoint-scale.md). `Container`'s job — max-width + horizontal centering — needed a decision about which of these (if any) it should reach for.

None of them fit cleanly. Reusing `consumer`/`portal` directly would mean `Container` has to know which app it's running in (a real app identity leaking into a component meant to be shared by both), or ship two variants. Reusing `component` conflates two genuinely different concerns — "at what viewport width should this component's own props change" is not the same question as "how wide should this page's content read," and there's no reason those two should ever have to share a scale.

## Decision

`Container` gets its own token category, `tokens/container.json` → `container.maxWidth`, with steps `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), plus a `full` value handled entirely in the component (no `max-width` set at all, rather than a token — `full` isn't a real CSS length, so giving it a token value would've meant a DTCG `dimension` type holding something that isn't one).

Which step a given page wants is that page's own decision at the call site (`<Container maxWidth="lg">`), not something `Container` infers from being consumer or portal — the same resolution already used for Box's breakpoints, applied here for the same reason.

**Styling mechanism, deliberately different from Box's own style props:** `Container` resolves `maxWidth` to a plain inline `style` with a `var(--ds-container-max-width-*)` reference, not through Box's generated-atomic-class machinery. Box's atomic classes exist specifically to avoid a measured per-render cost across hundreds of densely-repeated instances (decision-box-atomic-css-over-inline-styles.md) — `Container` is used once or twice per page, never densely repeated, so that cost doesn't apply. The constraint that *does* still apply regardless of mechanism — every token-backed value must resolve to a `var(--ds-*)` reference, never a literal (decision-box-must-use-css-custom-properties.md) — is satisfied either way; only the *mechanism* differs, matched to Container's actual usage pattern rather than copying Box's mechanism by default.

## A real bug found building this, not a hypothetical

Building `Container` as `<Box marginX="auto" style={{ maxWidth: ... }}>` looked correct and typechecked cleanly, but rendered wrong: every step (`sm` through `xl`) produced roughly the same ~90px-wide box instead of the intended progressive widths. Checked computed styles rather than guessing from the screenshot: `max-width` was resolving correctly at every step (640px, 768px, ...) the entire time — the bug wasn't in the token/var() resolution at all. The real cause: a flex item with `auto` side margins does not stretch to fill its container's cross axis by default — CSS's `align-items: stretch` gets overridden by auto margins, a real, spec-defined behavior. Without an explicit width, `Container` shrank to its content's size, and `max-width` never got a chance to clip anything, because there was never anything wider than the cap to begin with.

Fixed by adding `width: "100%"` to `Container`'s own style, ahead of `max-width` — this is the same reason Bootstrap's `.container` class has always set `width: 100%` explicitly rather than relying on ambient stretch behavior. Also makes `Container` robust regardless of what kind of parent it ends up inside (flex, grid, or plain block) — the earlier version only happened to look right in isolation, and would have silently failed anywhere with the exact conditions (flex parent, auto margins) that triggered this in the first place.

## Update — Box's `style` prop was later locked down

`Container`'s inline-style mechanism described above now goes through Box's `unsafeStyle` escape hatch, not a plain `style` prop — `Box` stopped accepting `style` at all, matching Blade's own `BaseBox` (`decisions/decision-box-style-prop-locked-down.md`). The reasoning in this document (why Container uses inline style instead of Box's atomic-class machinery) is unchanged; only the specific prop name `Container` reaches for internally changed.

## Consequences

- A fourth token category joins the "breakpoint-shaped but deliberately not sharing a scale" family in this codebase (`consumer`, `portal`, `component`, and now `container.maxWidth`) — worth remembering as an established pattern, not re-litigating each time a new component needs viewport- or width-related values: default to a dedicated scale for the component's own concern unless there's a specific reason to share one.
- Verified live in `apps/playground`'s Box variant gallery: all five `maxWidth` steps rendered at their correct, progressively wider computed pixel widths (checked via `getComputedStyle`, not just visually), correctly capped by available parent width where the step's own value exceeded it.
