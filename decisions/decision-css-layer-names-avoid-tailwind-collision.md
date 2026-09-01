# Decision: rename internal CSS layers to avoid Tailwind collision

## Context

`@farmsapp/design-system`'s CSS used native CSS cascade layers named `base`
and `components` (`@layer base { ... }`, `@layer components { ... }`) to
scope its own styles. These are also the exact names Tailwind CSS reserves
for its own layer system (`@tailwind base;`, `@tailwind components;`,
`@tailwind utilities;`).

## Problem found

Testing the first published release (`design-system@0.1.0`) inside a
Tailwind-based consumer app (`farmsapp-agent`) surfaced two issues:

1. A hard PostCSS error — `@layer base is used but no matching @tailwind
   base directive is present` — when our CSS was imported as a separate
   file from the app's Tailwind entry point.
2. After fixing the import to live in the same file as the `@tailwind`
   directives, a silent failure: every component's actual styles
   (Button, Input, Spinner, Divider, Badge, IconButton, FormLabel,
   FormHint — all 8 hand-written component CSS files, all wrapped in
   `@layer components { ... }`) were dropped entirely from the CSS
   Tailwind's PostCSS pipeline served to the browser. Confirmed by
   diffing the served bundle against the installed npm package: zero
   `ds-button`/`@layer components` occurrences in the served output,
   despite both being present in the installed file on disk.

Root cause: Tailwind's PostCSS plugin treats any `@layer base/components/
utilities { ... }` block anywhere in the CSS it processes as *input* to be
collected and re-emitted at the corresponding `@tailwind ...;` directive —
not as an independent native CSS layer. With our package and the consuming
app both declaring `@layer components { ... }` blocks, Tailwind's
collection/merge logic dropped ours.

## Decision

Renamed the design system's own layers to non-colliding names:
`base` → `ds-base`, `components` → `ds-components`. Changed in:
- `packages/design-system/src/base.css`
- All 8 component CSS files (Badge, Button, Divider, FormHint, FormLabel,
  IconButton, Input, Spinner)
- `packages/design-system/scripts/generate-atomic-css.mjs`'s layer
  registration statement

Not a breaking change for consumers — nothing in the public API references
layer names directly. Shipped as a patch release (`0.1.0` → `0.1.1`).

## Why

This affects *every* future consumer using Tailwind, not just this one
test app — a per-consumer workaround wasn't viable. Renaming to
`ds`-prefixed layer names sidesteps the collision permanently rather than
asking every Tailwind-using consumer to work around it.
