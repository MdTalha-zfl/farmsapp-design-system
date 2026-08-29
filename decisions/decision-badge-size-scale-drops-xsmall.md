# Badge size scale: 3 steps (small/medium/large) — Blade's `xsmall` dropped

- Status: accepted
- Date: 2026-08-29
- Context: Phase 7 — Badge

## Context

Blade's real `badgeTokens.ts` ships 4 sizes — `xsmall`(14px) / `small`(16px) / `medium`(20px) / `large`(24px) — each with its own height, horizontal padding, text-icon gap, and icon size. Checked directly against this project's own tokens: `packages/tokens/tokens/spacing.json`'s `space.4`(16px)/`space.5`(20px)/`space.6`(24px) already line up exactly with Blade's `small`/`medium`/`large` heights — but nothing in the scale produces 14px, and inventing one would break the project's own 8px-based spacing-grid decision (see `[[project-brand-and-audience]]`).

Separately, `decisions/decision-icon-size-color-reuse-tokens.md` already fixed this project's `Icon` component at 3 sizes — `small`(16px) is the *smallest* Icon size that exists. Blade's `xsmall`/`small` badges use Blade's own `xsmall` icon (smaller than 16px) to fit inside a 14–16px-tall badge. This project has no icon smaller than 16px to put inside an equivalent badge.

## Decision

**Ship 3 sizes, not 4 — `small`(16px) / `medium`(20px, default) / `large`(24px)** — mapped onto `space.4`/`space.5`/`space.6` directly, no new dimension values invented. `xsmall` is dropped, not deferred-with-a-gap: it's blocked by the same two constraints as `decision-badge-color-prop-scope-v1.md`'s blocked colors — it would need both a new spacing value (breaking the 8px grid) and a new Icon size (contradicting a decision already made deliberately, not an oversight).

Ported directly from Blade (numerically identical, just renamed to this project's own spacing steps):
- Horizontal padding: `space.2`(8px) for `small`/`medium`, `space.3`(12px) for `large`.
- Text-to-icon gap: `space.1`(4px) for `small`, `space.2`(8px) for `medium`/`large`.
- Border-radius: not size-dependent — matches Blade's own fixed-regardless-of-size `theme.border.radius.max`. **Superseded by `decisions/decision-badge-shape-prop.md`**: radius is fixed *per shape*, not fixed overall — this project added a `shape` prop (no Blade equivalent) that controls radius independently of `size`.

**Icon reuses `Icon`'s existing `small`(16px) size uniformly across all 3 Badge sizes** — no new Icon size invented to give `large` badges a bigger icon the way Blade does (Blade steps its icon between `xsmall`/`small`; this project's Icon has no smaller option to step down to for Badge's own `small`, so there's nothing to step between).

## Consequences

- **Known, deliberate tradeoff, not a bug:** a `small` Badge is 16px tall and its icon is also 16px — effectively zero vertical breathing room if an icon is used at `size="small"`. Verify this visually in a real browser once Badge renders; if it looks broken, the fix is discouraging `icon` + `size="small"` together (a dev-warn, matching `decisions/decision-badge-warn-not-throw-empty-children.md`'s "warn, don't throw" convention) — not inventing a sub-16px Icon size just to serve this one combination.
- Any future need for a genuinely tiny badge (14px-class, count-dot style) belongs to `Counter`/`Indicator`-shaped components, not a 4th Badge size — consistent with Blade itself keeping those as separate, unrelated components rather than folding them into Badge's own size scale.
