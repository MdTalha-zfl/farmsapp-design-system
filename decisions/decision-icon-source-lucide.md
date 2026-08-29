# Icon source: Lucide

- Status: accepted
- Date: 2026-08-27
- Context: Phase 7 Prerequisites — Icon (see `decisions/decision-icon-generation-pipeline.md` for the codegen mechanics this feeds)

## Context

Blade sources its icons from a proprietary Figma file, hit via the Figma REST API. This project has no equivalent design file and no Figma integration — real icon SVGs had to come from somewhere before any generation pipeline could exist at all.

## Decision

**Lucide** (via the `lucide-static` npm package, which ships every icon as a raw, standalone `.svg` file). Considered against the alternatives directly:

- **License**: MIT, no attribution required.
- **Consistency**: one stroke-based visual style, one 24×24 viewBox across the entire set — no per-icon style decision needed (unlike Heroicons' outline/solid split, which would force an explicit default-variant decision this project doesn't need yet).
- **Maintenance**: actively maintained (the maintained fork of Feather Icons), large real-world adoption.
- **Pipeline fit**: `lucide-static` ships raw SVG source files directly, consumable by a plain Node script with zero network calls at build time — a real, versioned, `pnpm-lock.yaml`-pinned dependency, not a live API integration.
- **Already `currentColor`-ready**: confirmed directly (not assumed) by reading real installed source — every Lucide SVG declares `stroke="currentColor"` once on its root `<svg>` element, inherited by every child automatically. This is what let the generation pipeline skip Blade's own AST fill/stroke-rewrite step entirely (see `decisions/decision-icon-generation-pipeline.md`).

## Consequences

- `packages/icons` depends on `lucide-static` as a `devDependency` (generation-time only — no runtime dependency on it ships in the published package; the generated `.tsx` components are self-contained).
- The starting icon set is a small, explicit, hand-reviewed subset (`packages/icons/scripts/icon-list.mjs`), not the full ~1600-icon Lucide catalog — real near-term needs (Button/Input), not speculative bulk import.
