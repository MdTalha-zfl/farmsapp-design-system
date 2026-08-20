# Learning Notes

A running log of what's being built in this repo, and — more importantly — *why*, written for someone doing their first monorepo / design-system build. Updated after each chunk of work.

---

## Some vocabulary up front

- **Monorepo** — one git repository containing many separately-installable packages (instead of one repo per package). This repo will eventually contain 7+ npm packages plus 2 apps, all versioned and tested together.
- **Package manager** — the tool that downloads your dependencies and manages `node_modules`. We're using **pnpm** (see Chunk 1 below for why, not npm's built-in one).
- **Workspace** — a package manager's term for "a monorepo it understands." `pnpm-workspace.yaml` tells pnpm which folders are packages.
- **Task runner / build orchestrator** — a tool that runs commands (build, lint, test) across many packages in the right order and skips work that hasn't changed. We're using **Turborepo**.
- **Bundler** — a tool that takes your source `.ts`/`.tsx` files and produces the actual files that get published to npm (or shipped to a browser). We're using **Rollup** for packages, **Vite** for the playground app, and **Next.js**'s own bundler for the docs app.

---

## Chunk 1 — Toolchain foundation

**Why:** Before any real code exists, the repo needs to agree on *how things get run*. Without this, every package would reinvent its own build/lint setup, and nothing could be run consistently across all of them at once.

**What we did:**
- `git init` — started version control.
- Installed **Node.js 24 (LTS)** and **pnpm 11**, and *pinned* both versions in files (`.node-version`, the `packageManager` field in `package.json`) so every contributor's machine — and CI later — uses the exact same versions. Without pinning, "works on my machine" bugs creep in from version drift.
- `pnpm-workspace.yaml` — tells pnpm "everything under `apps/` and `packages/` is a workspace member."
- `turbo.json` — defines the task pipeline (`build`, `lint`, `typecheck`, `test`) and, critically, `dependsOn: ["^build"]`, which tells Turborepo "before building package X, build everything X depends on first." This is what makes builds happen in the correct order automatically.
- `tsconfig.base.json` — one shared, strict TypeScript config every package extends, so type-safety rules are consistent everywhere instead of each package deciding its own.
- `.gitignore`, `.prettierrc.json` — housekeeping: don't commit `node_modules`/build output, and agree on code formatting.

**Gotcha we hit:** The installed Node (20) turned out to be past its official support window (end-of-life), and was also too old for the current version of pnpm to even run. Fixed by installing Node 24 via `winget` (Windows's package manager) instead of trying to force an old pnpm to work.

---

## Chunk 2 — Shared lint & style configs

**Why:** "Components must not hard-code brand colors" is a rule from the architecture doc — but a rule that's only written in a doc gets ignored under deadline pressure. Turning it into a *linter rule* makes it a build failure instead of a suggestion.

**What we did:**
- `packages/eslint-config` — a real npm package (not published, just workspace-internal) containing our shared ESLint rules. Split into a base config (for plain TypeScript packages) and a `/react` variant (adds React/JSX/accessibility rules) — so a package like `tokens` that has zero UI code isn't forced to install React-related tooling it doesn't need.
- `packages/stylelint-config` — same idea, for CSS. The key rule here is `stylelint-declaration-strict-value`, configured to reject any raw color value like `color: #ffffff` and only allow `color: var(--ds-something)`. We proved this actually works by writing a throwaway CSS file with a raw hex color and confirming Stylelint flagged it, then deleted the test file.

**Gotcha we hit:** Our first version of the ESLint config didn't know about Node.js's built-in globals (`module`, `require`, etc.), so it broke on `.cjs` config files. Real bug, fixed by explicitly telling ESLint which "environment" (Node vs. browser) each file type runs in.

---

## Chunk 3 — Shared build tooling + package generator

**Why:** Every package needs a build config, but writing one from scratch 7+ times both wastes time and *guarantees* they'll drift apart from each other over time. We wrote it once and made every package reuse it.

**What we did:**
- `tooling/build/rollup.config.base.mjs` — one shared Rollup configuration (Rollup is the tool that compiles TypeScript source into the `.js` + `.d.ts` files that actually get published). Every package's own tiny `rollup.config.mjs` just calls into this shared file with its own entry point.
- `tooling/generators` — a `plop` generator: run one command, answer two questions (package name, does it need React?), and get a fully-wired new package instantly, instead of copy-pasting an existing one and forgetting to rename something.

**Gotcha we hit (a real lesson about how tools resolve paths):** A shared config file that lives *outside* any package (like `tooling/build/rollup.config.base.mjs`) resolves its own `import` statements relative to *its own location on disk*, not relative to whichever package happens to be using it. This meant the Rollup plugin packages had to be installed at the *repository root*, not inside each individual package — a subtle but important rule about how Node.js resolves modules. We also hit the same "resolves relative to itself" surprise with the `plop` generator's file paths, twice, and only caught it because we tested the generator for real instead of assuming it worked.

---

## Chunk 4 — First real package, proven end-to-end

**Why:** Before repeating a pattern 6 more times, prove it actually works once. This is cheaper than discovering a fundamental problem after building 7 packages the same (broken) way.

**What we did:**
- Generated `packages/tokens` — the first package, chosen because nothing else depends on anything, so it's the simplest possible test case.
- Actually ran `pnpm install`, `turbo run build`, `turbo run lint`, `turbo run typecheck` — and inspected the *real output files* (not just "did the command exit successfully") to confirm Rollup produced a correct `.js` file and a correctly bundled `.d.ts` type-definition file.

**Gotcha we hit:** Turborepo needs to run the `pnpm` command internally, but `pnpm` wasn't available as a plain command on this machine (a Windows permissions issue — installing global command shortcuts normally needs administrator rights). Fixed by pointing Corepack (Node's built-in tool-version manager) at a folder the current user *can* write to.

---

## Chunk 5 — The remaining six packages

**Why:** With the pattern proven, replicate it — but the interesting part isn't the repetition, it's getting the *dependency wiring* right, since that's what makes `turbo run build` build things in the correct order automatically.

**What we did:**
- Generated `themes`, `utilities`, `primitives`, `components`, `icons`, `design-system` via the same generator.
- Hand-wired each package's real dependencies to match the architecture doc's rules — e.g. `primitives` depends on `tokens` + `utilities`; `components` depends on `primitives` + `utilities`; the `design-system` meta-package re-exports `components` + `primitives`. We deliberately did *not* add the Radix/Floating UI libraries yet, even though the architecture doc names them, because nothing uses them yet — adding a dependency before it's needed is exactly the kind of thing that bloats a project over time for no benefit.
- Verified: `turbo run build` built all 9 packages in the correct dependency order automatically (you can see this in the logs — `tokens` builds before `primitives`, which builds before `components`, which builds before `design-system`).

---

## Chunk 6 — The two apps

**Why:** `apps/playground` is a scratch space to try out components as they're built (rather than testing them inside a real product). `apps/docs` will eventually be the public documentation site. Both need to exist as real, buildable apps — even mostly empty ones — so the workspace's build pipeline covers 100% of the repo, not just the library packages.

**What we did:**
- `apps/playground` — a minimal Vite + React app. Builds to a real, deployable bundle.
- `apps/docs` — a minimal Next.js app (the App Router style, which is Next's current recommended approach). Produces a real static production build.

**Gotchas we hit (both real bugs, both fixed):**
1. Next.js generates its own `next-env.d.ts` file automatically, and that file intentionally uses a coding pattern (a "triple-slash reference") that our lint rules flag as an error elsewhere. Since it's a file Next.js owns and regenerates, not one we write, we told ESLint to skip linting it rather than fighting Next's own convention.
2. Next.js's image-optimization feature depends on a native (non-JavaScript) library called `sharp`, which pnpm 11 refuses to auto-install for security reasons (it blocks any dependency's install-time scripts by default, and makes you explicitly approve them) — we reviewed and approved it, the same way we did for `esbuild` earlier.

---

## Chunk 7 — Changesets + CI

**Why:** Two separate problems, both about to bite us once more than one person touches this repo:
1. *"What version number does this change deserve?"* — Left to guesswork at release time, this always turns into either arguing over semver or someone just bumping randomly. **Changesets** fixes this by having each PR include a tiny markdown file describing its own change and severity (patch/minor/major) at the time the change is made, when the author still remembers what they did.
2. *"Does every change actually get verified before merging?"* — Right now, the whole toolchain only gets checked when *we* remember to run it by hand. **CI** (Continuous Integration — an automated pipeline that runs on every pull request) makes that automatic and unskippable.

**What we did:**
- `.changeset/config.json` — configured Changesets, including one workspace-specific rule: `apps/docs` and `apps/playground` are excluded from versioning, since they're internal apps, not published packages — versioning them would be meaningless.
- `.github/workflows/ci.yml` — a GitHub Actions pipeline that runs on every pull request: install → lint → typecheck → build → test, in that order (cheapest/fastest checks first, so a typo gets caught in seconds, not after a 2-minute build).
- `.github/workflows/release.yml` — the publish pipeline. When changes land on `main`, this either opens a "Version Packages" pull request (bundling up all the pending changesets into real version bumps) or, once that PR is merged, actually publishes to npm. It uses **npm Trusted Publishing** (an npm feature that authenticates the GitHub Action directly, so there's no long-lived secret password stored in the repo that could leak).

**Gotcha we hit:** Our config said `baseBranch: "main"`, but `git init` had created a branch called `master` (an older default that some git installations still use). A mismatch like this wouldn't cause an error until someone actually tried to release — we caught and fixed it now by renaming the branch, before it became a problem nobody noticed until release day.

**Note:** These two workflow files are written correctly, but nothing has actually *run* them yet — that requires a GitHub remote (a repo pushed to github.com), which doesn't exist yet for this project. Also, real publishing won't work until the npm side of Trusted Publishing is configured once, manually, on npmjs.com — that's a one-time setup step for whoever owns the `@farmsapp` npm org, not something this repo's code can do on its own.

---

## Chunk 8 — Exit-criteria verification

**Why:** Every earlier chunk was verified on its own, in isolation. That's not quite the same as proving the *whole* Phase 1 scaffold works together, from a clean state, the way a new contributor (or CI) would actually experience it. This chunk closes that gap.

**What we did:**
- `pnpm install --frozen-lockfile` — the flag CI uses. It fails loudly if the lockfile and any `package.json` have drifted apart, so this proves everything is genuinely in sync, not just "works on this machine right now."
- `turbo run build lint typecheck --force` across the whole repo — the `--force` flag skips Turborepo's cache, so this was a fully fresh run, not one coasting on results from earlier chunks.
- The big one: actually exercised the **Changesets version-bump mechanism** for real, instead of just checking that its config file is valid. We wrote a real changeset file (a small markdown file describing "bump `tokens` by a patch version"), then ran `changeset version` for real. It correctly:
  - Bumped `@farmsapp/tokens` from `0.0.0` → `0.0.1`
  - **Cascaded that bump** to every package that depends on tokens (`primitives`, `themes`, `components`, `design-system`) — but correctly left `utilities` and `icons` alone, since neither depends on tokens. This is the dependency-graph awareness from Chunk 5 showing up again, now inside the release tooling itself.
  - Generated a real `CHANGELOG.md` per package, with the changeset's description as the entry.
- Since this was a *proof*, not a real release (these are still empty placeholder packages — bumping their version means nothing yet), we reverted all of it afterward: `git checkout` on the version-bumped `package.json` files, deleted the generated changelogs, deleted the probe changeset. Then rebuilt once more to confirm the repo was back to a clean, working state.

**The pattern here, worth noticing:** this is the same "prove it, then clean up" approach used earlier for the Stylelint rule (Chunk 2) and the package generator (Chunk 3) — verify a mechanism actually works by really running it against disposable input, rather than trusting that correct-looking config *must* behave correctly.

**Phase 1 is now complete** against the roadmap's own exit criteria: an empty monorepo that builds, lints, typechecks, and can version/publish end-to-end.

---

# Phase 2 — Primitive Tokens

Per the Token Foundation roadmap. Same chunked approach as Phase 1.

## Chunk 01 — Style Dictionary pipeline

**Why:** Before authoring a full color/type/space scale, prove that a token goes in one end and comes out the other correctly — as both a real CSS custom property and a real typed TS constant — using one throwaway value. Authoring 60+ real values against an unproven pipeline would mean redoing all of it if the pipeline itself had a problem.

**What we did:**
- Installed **Style Dictionary** (the tool that reads token source files and generates output in whatever formats you need) into `packages/tokens`.
- Authored one dummy token, `color.blue.500`, in `packages/tokens/tokens/color.json`, using the **W3C DTCG format** — a standardized way of writing design tokens as JSON (`$value`, `$type` keys) that's also what a future Figma sync would expect, so we're not picking a format now that has to be migrated later.
- Wrote a Style Dictionary config defining two outputs from that one source file: a CSS file (`build/css/tokens.css`, real custom properties like `--ds-color-blue-500`) and a generated TypeScript file (`src/generated/tokens.ts`, a real typed constant) that Rollup then bundles normally, exactly like every other package already does.
- The generated TS file is **build output, not source** — regenerated every build, never hand-edited, and added to `.gitignore` accordingly (same treatment as any other compiled output).

**It worked correctly on the first real run** — genuinely rare in this project so far, and worth noting as a contrast to the earlier chunks that each caught a bug. Inspected the real output by hand anyway rather than trusting a clean exit code: the CSS variable name, the TS constant, and the final bundled export were all exactly right.

**Extra verification, beyond what the roadmap asked for:** changed the dummy token's value and confirmed Turborepo's cache correctly detected it as a change and rebuilt (rather than serving a stale cached result) — this matters because a caching bug here would mean token *value* changes could silently fail to propagate, which would be a nasty, hard-to-notice class of bug later.

## Chunk 02 — Lint boundary for generated CSS

**Why (as originally planned):** Phase 1 built a Stylelint rule rejecting raw hex colors in hand-authored CSS. The worry was that the newly-generated `tokens.css` — which legitimately *contains* raw hex values, since that's where a token's real value has to live — would trip that same rule.

**What actually happened, and the correction worth recording:** it didn't trip the rule. Testing it for real (not just assuming) showed the strict-value rule only checks specific *standard* CSS properties (`color`, `background`, etc.) — a custom property declaration like `--ds-color-blue-500: #2b5a9e` has a property *name* of `--ds-color-blue-500`, which doesn't match any of those patterns, so the rule was never actually at risk here. This is a case where a prediction made in the roadmap turned out to be wrong once actually tested — worth being honest about rather than quietly writing the roadmap's original reasoning into history as if it had been correct.

Still added the exclusion anyway (`.stylelintignore`, excluding `**/build/**`), but for a better reason: build output shouldn't be linted as a general policy regardless of whether it happens to currently pass, since it's regenerated output nobody's meant to hand-fix if flagged, and future changes to the pipeline could introduce something that *does* get flagged.

**Gotcha this surfaced:** once `build/` was excluded, there was briefly *zero* hand-authored CSS anywhere in the repo (the only CSS that existed was the generated one) — which made the lint command hard-error with "no files found," since that's a genuinely different situation from "found files, no problems." Fixed by allowing empty input, which is the correct normal state until real component CSS exists in a later phase.

**Verification:** confirmed with a real throwaway test file that a genuine violation is still caught (same "prove it, then delete the test file" pattern used throughout this project) while the generated file is correctly excluded — checked that *exactly one* file was linted, not zero and not more than expected.

---
