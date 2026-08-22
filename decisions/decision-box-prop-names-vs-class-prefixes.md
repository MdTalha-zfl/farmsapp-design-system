# Box's public prop names are full words, decoupled from the generated CSS's short class prefixes

- Status: accepted
- Date: 2026-08-22
- Context: Phase 5 (Primitives), Chunk 02 — Box, requested by the user after the first pass shipped with abbreviated prop names

## Context

Box's first version used short, CSS-utility-style prop names (`p`, `pt`, `pr`, `pb`, `pl`, `px`, `py`, `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`) — matching the convention `atomicConfig.mjs`'s generated CSS class names already use (`ds-p-2`, `ds-mt-4`). Asked to rename the *React prop* surface to full words (`padding`, `paddingTop`, `paddingX`, `margin`, `marginTop`, ...) for readability and IDE autocomplete discoverability — short abbreviations don't self-document in an editor's suggestion list the way `paddingTop` does.

The generated CSS class names have a real, separate reason to stay short: every Box instance ships that string in the HTML, and this project's audience is explicitly low-end-device/weak-connectivity — the same reasoning already applied when the atomic-CSS approach was chosen over runtime styles in the first place (decision-box-atomic-css-over-inline-styles.md).

## Decision

Split what were previously the same string into two independent fields in `atomicConfig.mjs`: the object *key* is the public React prop name (full word), and a separate `prefix` field is the short string used only when generating the CSS class name. `padding: { cssProps: [...], prefix: "p" }` means `<Box padding="2">` still emits the class `ds-p-2`, not `ds-padding-2` — renaming a prop for readability never touches the generated CSS's byte size, because nothing about `Box.tsx`'s resolver or `generate-atomic-css.mjs` reads the object key for anything except prop-matching; every place that produces output already went through `cfg.prefix`, so this was a pure data change, not a logic change, in both files.

Full prop list: `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingX`, `paddingY`, `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginX`, `marginY`. `gap`/`rowGap`/`columnGap` were already full words, unchanged.

## Consequences

- Any future prop added to `atomicConfig.mjs` should follow the same split — a readable public name as the key, a short `prefix` for the class name — rather than reusing one string for both, now that the pattern exists.
- The generated CSS's **base** rules are byte-for-byte unaffected by this change (confirmed: same 257 rules, same class names, before and after).
- `apps/playground`'s Box variant gallery (`decisions/decision-box-atomic-css-over-inline-styles.md`'s hardening pass) was updated to the new names and re-verified — same 7/7 real browser assertions, same visual output, confirming the rename touched only naming, not behavior for the paths that were checked.

## Follow-on bug, found later (not caught by the above)

The verification above checked `rules.length` (base rules) and visual output — it never checked the generated `@media` blocks. `atomicConfig.mjs` had one hand-listed array this rename missed: `RESPONSIVE_PROP_KEYS`, a separate list of which prop keys are allowed to vary per breakpoint, still held the *old* short names (`"p"`, `"pt"`, ... `"my"`) after every `SPACE_PROPS` key was renamed to a full word. `Box.tsx` never reads that array — it independently hardcodes "every `SPACE_PROPS`/`KEYWORD_PROPS` key is responsive" — so Box kept emitting classes like `ds-p-4@md` correctly. But `generate-atomic-css.mjs`'s `RESPONSIVE_PROP_KEYS.includes(propKey)` check went permanently false for every padding/margin prop (`"padding"` was never in the stale array), so the `@media` rule those classes need was silently never generated. Every responsive padding/margin usage of Box had been a no-op — class in the DOM, no matching CSS rule — since the rename, undetected because nothing in the earlier verification diffed the `@media` blocks specifically.

Found while re-reading this file to explain it to the user; confirmed against the real build (`build/css/atomic.css` had a working `.ds-gap-2\@md` rule — `gap`'s key was never renamed, so it never went stale — but zero `.ds-p-*@md` or `.ds-m-*@md` rules). Fixed by deriving `RESPONSIVE_PROP_KEYS` from `Object.keys(SPACE_PROPS)` + `Object.keys(KEYWORD_PROPS)` instead of hand-listing it, matching this file's own stated "derive, don't hand-list" discipline (already applied to token step names) — makes this specific class of bug structurally impossible to reintroduce, rather than just re-syncing the strings once more. Rebuilt and confirmed `.ds-p-2\@md` / `.ds-m-2\@md` now generate; full `turbo run build lint typecheck --force` still 19/19.
