# Generated icon components are gitignored, regenerated every build — not committed

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon

## Context

Blade commits its generated icon `.tsx` files to git, run "manually/CI on demand" per their own trace. Blindly copying that choice was rejected in favor of checking whether Blade's own reason for it actually applies here.

## Decision

**`packages/icons/src/generated/` (both the per-icon wrapper files and the `_raw/` SVGR output) is gitignored, regenerated fresh on every `pnpm build`, never committed.**

Blade's own stated reason to commit is a live Figma API call — a real, external, non-reproducible-without-network-and-credentials dependency, which genuinely justifies freezing the output as committed source rather than re-fetching it on every CI run. That reason does not transfer: this project's icon source (`lucide-static`) is a normal, versioned, `pnpm-lock.yaml`-pinned npm dependency. Regenerating from it on every build is exactly as reproducible, and just as fast (milliseconds, for a handful of small SVGs), as `generate-atomic-css.mjs` already is for Box's own atomic CSS.

This also matches this project's own already-established, consistent precedent — nothing else generated in this repo is hand-maintained-after-first-generation: `packages/design-system/build/css/atomic.css` and `packages/design-system/src/components/Box/generatedValidSteps.mjs` are both regenerated on every build, and `.gitignore` already carries a `**/src/generated/` glob for precisely this shape of file (previously used only by `packages/tokens/src/generated/tokens.ts` — confirmed by grep before relying on it, not assumed).

## Consequences

- Adding an icon later is a one-line addition to `packages/icons/scripts/icon-list.mjs` — a small, reviewable diff. The generated `.tsx` files never appear in a PR diff at all, keeping the real, meaningful change (which icon was added) legible instead of buried under mechanically-generated JSX.
- `packages/icons/rollup.config.mjs`'s entry point (`./src/generated/index.tsx`) does not exist until `node scripts/generate-icons.mjs` has run — exactly mirroring `packages/design-system`'s own `"build": "node scripts/generate-atomic-css.mjs && rollup -c"` two-step build script, applied here as `"build": "node scripts/generate-icons.mjs && rollup -c"`.
- A fresh clone or a fresh `pnpm install` has no icon components on disk until the first `pnpm build` runs — expected and consistent with how `atomic.css`/`generatedValidSteps.mjs` already behave; not a new class of first-run friction this project didn't already have.
