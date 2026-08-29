# `packages/icons` ships its own `icon.css`, coupled to `@farmsapp/tokens` directly — not `@farmsapp/design-system`'s internals

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon

## Context

`Icon`'s `size`/`color` classes need to reference real design tokens (spacing steps, text colors). Two real candidates existed: generate them into `@farmsapp/design-system`'s own `atomic.css` (reusing `TOKEN_TEXT_PROPS`/`atomicConfig.mjs`'s existing machinery), or give `packages/icons` its own small, independent, hand-written stylesheet.

## Decision

**`packages/icons/src/icon.css`** — a new, small, hand-written file, copied verbatim into `build/icon.css` by `generate-icons.mjs` (the same "hand-written fixed CSS gets read and passed through, not generated" discipline `@farmsapp/design-system`'s own `base.css` already established). It references `@farmsapp/tokens`'s real custom properties (`--ds-color-text-*`, `--ds-space-*`) directly.

**Deliberately does *not* import or generate into `@farmsapp/design-system`'s `atomicConfig.mjs`/`resolveTypographyClasses.ts`**, even though the shape is similar. Those are explicitly internal to that package — `decisions/decision-export-resolve-box-class-names.md` already scopes internal seams like `resolveBoxClassNames` to siblings *within* `@farmsapp/design-system`, not cross-package consumption. Coupling `packages/icons` to `design-system`'s internal naming convention would make `icons` fragile to a refactor of a package it doesn't otherwise depend on at all.

Coupling instead to `@farmsapp/tokens` — the most foundational, most stable layer in this whole system, already a real `dependencies` entry in `packages/icons/package.json` — keeps `icons` genuinely independent of `design-system`. A consumer loads `@farmsapp/icons/css` alongside `@farmsapp/tokens/css`, with no dependency on whether `@farmsapp/design-system` is even present.

## Consequences

- One more CSS import for consumers: `import "@farmsapp/icons/css";`, alongside `@farmsapp/tokens/css` (required) and `@farmsapp/design-system/css` (if also using Box/Text/etc. — not required just to use Icon).
- `packages/icons/package.json` gained a real `dependencies` entry: `"@farmsapp/tokens": "workspace:*"` — a genuine CSS-cascade dependency (not just a code-import one), matching how `packages/design-system/package.json` already declares `@farmsapp/tokens` for the identical mixed reason.
- `sideEffects` changed from `false` to `["./build/icon.css"]` so a bare `import "@farmsapp/icons/css"` isn't tree-shaken away by a bundler that doesn't know the import has a real effect.
