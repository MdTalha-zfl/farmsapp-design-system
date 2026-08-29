# Storybook — how it was set up, and why

A teaching walkthrough of everything that went into `apps/storybook`: every file, every decision, and the reasoning behind each one. Written as a companion to `LEARNING.md`'s own (much shorter) entry and `decisions/decision-storybook-setup.md`'s ADR — this file goes deeper into *how* and *why*, for learning purposes.

## What Storybook actually is

Storybook is a standalone dev server + static-site builder that renders your React components in isolation, outside of any real app. You write small files (`*.stories.tsx`) that say "render this component with these props," and Storybook turns each one into:

- a sandboxed page you can open, interact with, and visually inspect
- a "Controls" panel that lets you change props live, without editing code
- an auto-generated docs page (props table, description) if you opt in
- a static site you can build and deploy (`storybook build` → `storybook-static/`), so non-developers can browse the whole library without running anything locally

For a design system specifically, it solves a real problem: without it, the only way to see what `<Text variant="body" size="large">` actually looks like is to import it into some throwaway page (`apps/playground` was doing exactly this) or read the CSS in your head. Storybook gives every component — and, as built here, every *token* — a permanent, browsable home.

## The shape of what got built

```
apps/storybook/                          ← a new workspace app (like apps/docs, apps/playground)
  .storybook/
    main.ts                              ← "where are my stories, which addons, which builder"
    preview.tsx                          ← "how should every story be wrapped/decorated"
  src/
    tokens/
      readToken.ts                       ← reads a CSS custom property's live value
      ColorScale.tsx                     ← reusable swatch-row components
      Colors.stories.tsx                 ← Tokens/Colors catalog page
      Scales.stories.tsx                 ← Tokens/Scales (spacing, radius, border-width, container)
      Typography.stories.tsx             ← Tokens/Typography
      Elevation.stories.tsx              ← Tokens/Elevation
  package.json / vite.config.ts / tsconfig.json / eslint.config.mjs

packages/design-system/src/components/
  Box/Box.stories.tsx                    ← colocated with the component it documents
  Stack/Stack.stories.tsx
  Inline/Inline.stories.tsx
  Container/Container.stories.tsx
  Text/Text.stories.tsx
  Heading/Heading.stories.tsx
  VisuallyHidden/VisuallyHidden.stories.tsx
```

Two halves, deliberately living in two different places — that split is explained in its own section below, because it's one of the real decisions, not just a filing choice.

## Step 1 — Scaffolding the app shell

Before touching Storybook at all, `apps/storybook` needed to exist as a real workspace member: something `pnpm-workspace.yaml`'s `apps/*` glob would pick up, with its own `package.json`, and a build tool (Vite) to actually compile and serve React/TypeScript.

This was copied in shape from `apps/playground`, which already does exactly this for its own demo page:

```json
// apps/storybook/package.json (before Storybook was added)
{
  "name": "@farmsapp/storybook",
  "private": true,
  "type": "module",
  "dependencies": {
    "@farmsapp/design-system": "workspace:*",
    "@farmsapp/themes": "workspace:*",
    "@farmsapp/tokens": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@farmsapp/eslint-config": "workspace:*",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0",
    "typescript": "^5.7.0"
  }
}
```

The `workspace:*` version specifiers are pnpm's monorepo-local linking — they mean "always use whatever version of this package lives in this same repo," resolved as a symlink into `node_modules`, not fetched from npm. This is why `apps/storybook` can import `@farmsapp/design-system` and immediately see changes, without publishing anything.

`tsconfig.json` and `eslint.config.mjs` were also copied from `apps/playground`'s shape (extend the shared base configs, add TypeScript project references to the three packages it depends on) — nothing Storybook-specific yet at this point.

## Step 2 — Running the real Storybook initializer, not hand-writing config

This is a decision worth explaining, not just a "why not." The latest published Storybook version turned out to be **10.5.10** — checked directly via `npm view storybook version`, because guessing would have been irresponsible: Storybook's config format has changed meaningfully across major versions (v7→v8→v9→v10 each restructured things), and any version much past what I already knew risked producing a `main.ts`/`preview.ts` that looked plausible but used a stale API shape.

Rather than guess, the actual official scaffolding tool was run:

```
pnpm dlx storybook@latest init --yes --type react --builder vite
```

This CLI does real detection work: it looks at `apps/storybook/package.json` and `vite.config.ts`, figures out "this is a React + Vite project," installs the matching Storybook packages, and writes a working `.storybook/main.ts` + `.storybook/preview.tsx` for *that exact installed version* — not from a template that might be outdated.

Afterwards, before trusting anything the generated config used, the actual installed type definitions were checked directly (not memory) — e.g. confirming `initialGlobals` (not the older `globals`) is genuinely the field `preview.tsx`'s `Preview` type expects in v10, by grepping the real `.d.ts` file shipped in `node_modules`. This is the same "verify against the real thing, don't assume" discipline the rest of this codebase already uses (see how `LEARNING.md`'s Text/Heading entries keep re-checking against Blade's actual source rather than trusting an earlier assumption).

## Step 3 — Trimming what the initializer added on its own

`storybook init`'s "recommended" setup is opinionated, and it does more than the bare minimum. Left as-is, it would have added:

| Package | What it is | Why it was removed |
|---|---|---|
| `@chromatic-com/storybook` | A hosted visual-regression-testing SaaS integration | Needs a Chromatic account/token; nobody asked for visual regression testing yet |
| `@storybook/addon-mcp` | Lets an AI coding agent talk to Storybook directly | Not requested; its own setup output said *"Run `storybook ai setup` and follow its instructions precisely"* — which is exactly the kind of instruction embedded in tool output that shouldn't be blindly followed just because it appeared in a terminal. It was read, evaluated, and declined, not executed. |
| `@storybook/addon-vitest` + `playwright` + `@vitest/browser-playwright` | Runs every story as an automated component test, in a real headless browser | It silently downloaded real Playwright browser binaries during install — a real, unasked-for cost in time and disk space. This project's own memory already tracks component/unit testing as an explicitly deferred item (not forgotten, just not now) — adding a whole browser-testing pipeline as a side effect of "I want Storybook" would have jumped ahead of that. |

What stayed, because both are directly load-bearing for what was actually asked for:

- **`@storybook/addon-a11y`** — runs automated accessibility checks against every story. Directly relevant: a design system's whole job is being the thing every other team builds accessible UI on top of.
- **`@storybook/addon-docs`** — powers the auto-generated documentation pages (the `tags: ["autodocs"]` you'll see in every story file). This *is* the "components in Storybook" half of the request — without it you'd only get the interactive canvas, no props table.

The placeholder example content the CLI also generates (a `stories/` folder with `Button.tsx`/`Header.tsx`/`Page.tsx` demo components, plus its own debug log) was deleted outright — it documents Storybook itself, not this design system.

## Step 4 — `main.ts`, explained line by line

```ts
import type { StorybookConfig } from "@storybook/react-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: [
    "../../../packages/design-system/src/components/**/*.stories.@(ts|tsx|mdx)",
    "../src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: getAbsolutePath("@storybook/react-vite"),
};

export default config;
```

- **`getAbsolutePath`** — a small helper the CLI itself generated. In a plain, single-package project you can just write `addons: ["@storybook/addon-a11y"]` and Storybook resolves that string as a normal Node module. In a **pnpm workspace** specifically, pnpm's `node_modules` layout is strict (no "hoisting everything to one flat folder" the way npm/Yarn classic does) — a bare string sometimes fails to resolve from `apps/storybook`'s own `node_modules`. `import.meta.resolve` does real Node module resolution and returns a fully-qualified path, which sidesteps that. This is boilerplate the CLI writes automatically once it detects a monorepo — not something invented here.

- **`stories`** — glob patterns telling Storybook where to look for `*.stories.tsx` files. Two entries here, because of the colocation decision (next section): one reaches *up and across* into `packages/design-system/src/components/`, the other stays local to `apps/storybook/src/`. Storybook doesn't care that these live in a different workspace package — it's just a Vite dev server pointed at a set of file globs.

- **`addons`** — the trimmed list from Step 3.

- **`framework: "@storybook/react-vite"`** — tells Storybook which renderer (React) and which bundler (Vite, not Webpack) to use. This matched the rest of the monorepo, which already standardized on Vite for `apps/playground`.

## Step 5 — `preview.tsx`, explained line by line

`main.ts` controls *what Storybook finds*; `preview.tsx` controls *what wraps every story when it renders*. This file is where the design system's own runtime behavior (themes, global CSS) gets connected.

```tsx
import type { Preview, Decorator } from "@storybook/react-vite";
import { ThemeProvider } from "@farmsapp/themes";
import "@farmsapp/tokens/css";
import "@farmsapp/design-system/css";
```

The two CSS imports are side-effect imports — they don't bring in any JS value, they just make Vite include that stylesheet in the page. Without them, every component would render completely unstyled (no colors, no spacing, no fonts), because Box/Text/Heading don't inline any CSS themselves — they only ever emit class names that reference pre-generated rules living in these two files (see `decisions/decision-box-atomic-css-over-inline-styles.md` for why). **Important nuance**: these come from `packages/tokens/build/css/tokens.css` and `packages/design-system/build/css/atomic.css` — the *built* output, not source. `atomic.css` in particular isn't something that exists as hand-written source at all — it's generated by a build script that enumerates every prop/value combination Box supports. That's why `pnpm build` has to run for those two packages before Storybook's dev server has anything to show.

```tsx
const withTheme: Decorator = (Story, context) => {
  const { theme, brand } = context.globals;
  document.documentElement.setAttribute("data-theme", theme);
  if (brand && brand !== "default") {
    document.documentElement.setAttribute("data-brand", brand);
  } else {
    document.documentElement.removeAttribute("data-brand");
  }

  return (
    <ThemeProvider key={`${theme}-${brand}`}>
      <Story />
    </ThemeProvider>
  );
};
```

This is a **decorator** — a function that wraps every single story's rendered output. Here's the reasoning chain that produced it:

1. This design system's real theming mechanism (already built, in `packages/themes`) works by setting `data-theme="dark"` / `data-brand="pilot"` attributes on the `<html>` element. CSS rules like `[data-theme="dark"] { --ds-color-surface-base: ...; }` then take over via ordinary CSS cascade — no JavaScript re-render needed for styling to update.
2. Storybook has a built-in mechanism for "let the person viewing this page flip a setting from a toolbar" — **globals** + **globalTypes**, configured further down in the same file.
3. So the decorator's job is simple: read whatever the toolbar is currently set to (`context.globals`), and apply it the *exact same way the real app would* — by setting those same two DOM attributes. This isn't a Storybook-specific simulation of theming; it's exercising the real mechanism.
4. The one wrinkle: `ThemeProvider` (see `packages/themes/src/ThemeProvider.tsx`) only reads `data-theme`/`data-brand` **once, when it first mounts** (`useState(readInitialTheme)`), because a real app sets those attributes before React ever runs (a blocking `<script>` in `<head>`, to avoid a flash of the wrong theme) and never needs to re-read them after that. Storybook's toolbar can change *while the page is already running*, though — so simply updating the DOM attribute wouldn't be enough; `ThemeProvider`'s own internal state would still remember the old value. The fix used here is `key={theme}-${brand}\``: React treats a changed `key` as "this is now a different component instance," unmounts the old `ThemeProvider`, and mounts a fresh one — which re-runs `useState(readInitialTheme)` against the now-updated attribute. A small trick, but a precise one: it doesn't touch `ThemeProvider`'s own code at all, it just uses React's own remount semantics to get the same effect a real page load would produce.

```tsx
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: "todo" },
  },
  globalTypes: {
    theme: {
      description: "Light/dark theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    brand: {
      description: "Brand override",
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default" },
          { value: "pilot", title: "Pilot" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", brand: "default" },
  decorators: [withTheme],
};
```

- **`globalTypes`** is what actually puts the Theme/Brand dropdowns in Storybook's top toolbar. Each entry (`theme`, `brand`) becomes one dropdown; `items` are its options. `brand`'s two options map to this project's real, currently-single brand override (`"pilot"`, per `packages/themes/src/ThemeProvider.tsx`'s own comment: *"Right now that's exactly one value, 'pilot'"*) plus a `"default"` meaning "no override."
- **`a11y: { test: "todo" }`** — the accessibility addon's setting for how strict to be: flag violations for review, but don't fail a CI run over them yet. A deliberately soft starting point, matching "just set this up" rather than "also gate builds on it."
- **`decorators: [withTheme]`** — registers the decorator above to run for *every* story, automatically. No individual story file needs to know theming exists.

## Step 6 — Where component stories live, and why that's a real decision

Two options existed for where `Box.stories.tsx` (etc.) should live:

- **(a)** Centralized: `apps/storybook/stories/Box.stories.tsx`, `apps/storybook/stories/Text.stories.tsx`, ...
- **(b)** Colocated: `packages/design-system/src/components/Box/Box.stories.tsx`, right next to `Box.tsx` itself.

**(b) was chosen** — and importantly, this wasn't a fresh choice invented for Storybook. Back when this codebase moved from a flat `src/*.tsx` layout to one-folder-per-component (`decisions/decision-per-component-folder-structure.md`, written before any component even had a story), the reasoning already on record was: *"each of which will eventually want its own tests and Storybook stories alongside its implementation."* So `Box/Box.stories.tsx` living next to `Box/Box.tsx` is that earlier decision being followed through, not a new one.

Why colocation is genuinely better, not just "what was already planned":
- When you're editing `Text.tsx`, its story file is right there — no context-switching to a different package to update its demo.
- It scales: a future `Button`, `Dialog`, `Menu` (Phase 7+) each get their story written in the same folder as their implementation, from day one, rather than accumulating a second, parallel "where do I put stories" decision every time.
- Nothing about the *published* package changes because of this — `packages/design-system`'s Rollup build (`rollup.config.mjs`) only ever bundles starting from `src/index.tsx`, and `*.stories.tsx` files are never imported from there, so they're never included in what actually ships to consumers of `@farmsapp/design-system`.

The one real cost: `packages/design-system/package.json` needed two new **devDependencies** — `storybook` and `@storybook/react-vite` — purely so TypeScript can resolve the `import type { Meta, StoryObj } from "@storybook/react-vite"` used inside story files. This is a source-time-only cost (these packages are never bundled into the published output), caught for real by running `tsc --noEmit` and watching it fail with `Cannot find module '@storybook/react-vite'` before the dependency was added — not assumed to be necessary.

### Anatomy of one story file (`Box.stories.tsx`)

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box";

const meta = {
  title: "Components/Box",
  component: Box,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "select", options: ["base", "raised", "sunken", "overlay"] },
    // ...
  },
  args: {
    padding: "4",
    borderRadius: "md",
    // ...
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Surfaces: Story = {
  render: (args) => ( /* ... */ ),
  args: { children: undefined },
};
```

This is the **CSF3** format (Component Story Format v3) — the current standard way to write stories, and has been stable across Storybook versions for a while, unlike the config-file shape:

- **`meta`** (the `default` export) describes the *component as a whole*: which component (`component: Box`), where it appears in Storybook's sidebar (`title: "Components/Box"`), whether to generate a docs page (`tags: ["autodocs"]`), what default prop values every story starts from (`args`), and how each prop should be editable in the Controls panel (`argTypes` — e.g. `backgroundColor` becomes a dropdown with exactly Box's four real surface values, not a free-text box).
- **`satisfies Meta<typeof Box>`** — TypeScript checking that `meta` actually matches `Box`'s real prop types, without widening `meta`'s own inferred type. This is what lets `StoryObj<typeof meta>` downstream correctly infer that a story's `args` must be valid `BoxProps`.
- **Each named export** (`Default`, `Surfaces`) is one story — one specific way of rendering the component. `Default` has no overrides, so it just renders with `meta`'s own `args`. `Surfaces` supplies a custom `render` function when a story needs to show *multiple* renders side by side (here: every `backgroundColor` value at once) rather than a single instance with controls.
- **`autodocs`** — the tag that tells `@storybook/addon-docs` to auto-generate a full documentation page for this component: a props table (derived from `Box`'s real TypeScript types), the `Default` story embedded live, and any JSDoc comments on the component picked up as prose.

Every other component story (`Stack`, `Inline`, `Container`, `Text`, `Heading`, `VisuallyHidden`) follows this same shape, just with `argTypes` tailored to that component's own real prop surface (e.g. `Text.stories.tsx`'s `argTypes` list every real `TextColor`/`TextWeight`/`TextVariant` value, read directly from `resolveTypographyClasses.ts`, not guessed).

## Step 7 — The token catalog, and the one core lesson it's built around

This is the part worth understanding most carefully, because it's a direct, concrete application of a rule this project already committed to before Storybook existed.

**The problem it solves:** `@farmsapp/tokens` exports design tokens two different ways:
1. As **CSS custom properties** (`--ds-color-brand-9: #193921;`, shipped in `tokens.css`) — these live in the browser's style cascade, and can be *overridden* by later, more specific CSS rules. That's exactly how theme (`[data-theme="dark"] { --ds-color-brand-9: ...; }`) and brand (`[data-brand="pilot"] { --ds-color-brand-9: ...; }`) overrides work — a `var(--ds-color-brand-9)` reference always resolves to whatever's currently in effect.
2. As **flattened TypeScript constants** (`export const ColorBrand9 = "#193921";`, in `packages/tokens/src/generated/tokens.ts`) — these are just plain JavaScript string values, computed once at build time. They have **no idea** a dark theme or a brand override exists; `ColorBrand9` is always `"#193921"`, full stop, regardless of what's on the page.

If the token catalog had imported `ColorBrand9` and displayed it directly, the swatches would look right at first glance — but flipping the Theme/Brand toolbar would do *nothing* to them, because they're just static strings, disconnected from the DOM entirely. That would be a genuinely misleading catalog: it would show tokens that don't actually respond the way real tokens do in a real app.

**The fix**, `apps/storybook/src/tokens/readToken.ts`:

```ts
export function readToken(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
```

`getComputedStyle` asks the browser: "after applying every CSS rule that currently matches this element — cascade, specificity, `@layer` order, `[data-theme]`/`[data-brand]` attribute selectors, all of it — what's the *actual* value of this custom property right now?" That's a live, real answer, not a cached one. Every swatch in the catalog calls `readToken("--ds-color-brand-9")` (etc.) **during render**, so:

- When the `withTheme` decorator (Step 5) sets `data-theme="dark"` on `<html>` and remounts the tree, React re-renders the story, which calls `readToken` again, which now sees the dark-mode value.
- The catalog never has to know or care *how* theming works — it just always asks the browser for the current truth.

**How each catalog page is built**, using `Colors.stories.tsx` as the example: a small reusable component, `ColorScale`, takes a family name and a CSS variable prefix (e.g. `"--ds-color-brand"`), loops over steps `1`–`12`, and for each one renders a swatch whose `background` is `var(--ds-color-brand-9)` (so the browser paints it, no JS needed for the color itself) *plus* a text label showing `readToken`'s resolved hex value (so you can also read the exact value, not just eyeball a color):

```tsx
export function ColorScale({ label, prefix }: { label: string; prefix: string }) {
  return (
    <Box>
      <Box unsafeStyle={{ fontWeight: 600 }}>{label}</Box>
      <Box display="flex">
        {STEPS.map((step) => {
          const varName = `${prefix}-${step}`;
          const value = readToken(varName);
          return (
            <Box key={step} display="flex" flexDirection="column" alignItems="center">
              <Box unsafeStyle={{ width: 56, height: 56, background: `var(${varName})` }} />
              <Box unsafeStyle={{ fontSize: "0.625rem" }}>{value}</Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
```

The remaining four catalog files follow the same "loop over a known scale, render + label each step" pattern for different token families:
- **`Scales.stories.tsx`** — spacing (`--ds-space-*`, shown as bars sized by width), radius (`--ds-radius-*`, shown as rounded boxes), border-width, and `Container`'s max-width scale.
- **`Typography.stories.tsx`** — the composite `--ds-text-*` tokens (each one bundles weight/size/line-height/font-family into a single CSS `font` shorthand — see the comment in `tokens.css` on why letter-spacing can't ride along in that shorthand), plus the raw font-size and font-weight scales individually.
- **`Elevation.stories.tsx`** — the two named shadow tokens (`elevation.card`, `elevation.dialog`), which — like colors — automatically swap to their dark-mode-tuned values when the Theme toolbar flips, because they're also `var()` references resolved live.

None of this required any new tokens infrastructure — `packages/tokens` stays exactly what it was (a values-only package with no React dependency at all). All of the presentation logic lives in `apps/storybook`, which is the one place in this monorepo whose whole job is "depend on everything and show it."

## Step 8 — Wiring into the shared monorepo tooling

A few small, easy-to-miss changes were needed so `apps/storybook` behaves like every other workspace member under the repo's shared tooling, rather than being a special case:

- **`turbo.json`** — the shared `build` task declares which output folders should be cached (`outputs: [...]`). `storybook build`'s default output directory is `storybook-static/`, which wasn't in that list yet, so it was added (`"storybook-static/**"`) — otherwise Turborepo would still run the build correctly, it just wouldn't know what to cache/restore for it.
- **`eslint.config.mjs`** (repo root) — the root-level bare `eslint .` (part of `pnpm lint`) has its own `ignores` list separate from each package's own lint step; `storybook-static/**` was added there too, so a local build output sitting on disk never accidentally gets linted.
- **`.gitignore` / `.prettierignore`** — the Storybook CLI itself had *already* added `storybook-static/` (build output) and `*storybook.log` (its own debug log) to both of these automatically, as part of `storybook init`. Nothing needed to be added by hand here — just noticed and left alone.

## How to actually run it

```bash
# one-time (or after changing any component/token): build the packages
# Storybook's CSS imports depend on
pnpm build

# start the dev server
pnpm --filter @farmsapp/storybook dev
# → http://localhost:6006
```

Why the build step is needed first: `preview.tsx` imports `@farmsapp/tokens/css` and `@farmsapp/design-system/css`, which resolve to `packages/tokens/build/css/tokens.css` and `packages/design-system/build/css/atomic.css` — generated files, not source. This matches how `apps/playground` and `apps/docs` already work (neither of their `dev` scripts rebuilds their dependencies automatically either) — it's an existing convention in this repo, not something new introduced for Storybook.

To produce the static, deployable site instead of running the dev server:

```bash
pnpm --filter @farmsapp/storybook build
# → apps/storybook/storybook-static/
```

## Everything that changed, in one table

| File | What happened |
|---|---|
| `apps/storybook/` (whole directory) | New app: `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.storybook/main.ts`, `.storybook/preview.tsx`, `src/tokens/*` |
| `packages/design-system/src/components/*/{Name}.stories.tsx` | 7 new files, one per existing primitive |
| `packages/design-system/package.json` | Added `storybook` + `@storybook/react-vite` devDependencies (types only) |
| `turbo.json` | Added `storybook-static/**` to the shared `build` task's cacheable outputs |
| `eslint.config.mjs` (root) | Added `**/storybook-static/**` to the root lint ignore list |
| `.gitignore` / `.prettierignore` | `storybook-static/` + `*storybook.log` — added automatically by the Storybook CLI itself |
| `decisions/decision-storybook-setup.md` | The ADR-style record of the real decisions above |
| `LEARNING.md` | A running-log entry summarizing this work |

## What's deliberately not here yet

- **No component tests** (`@storybook/addon-vitest`) — stripped in Step 3; this project already tracks component/unit testing as a separate, deferred item.
- **No Chromatic / visual regression** — stripped in Step 3; would need an external account, and nobody's asked for automated screenshot diffing yet.
- **No Button/Input/Dialog/Menu stories** — those components don't exist yet (Phase 7+ per `LEARNING.md`). When they're built, their story file goes in their own component folder from the start, following the same pattern `Box.stories.tsx` established here.

Both are easy to add later — nothing about today's setup blocks them, they just weren't free defaults worth carrying silently just because an installer offered them.
