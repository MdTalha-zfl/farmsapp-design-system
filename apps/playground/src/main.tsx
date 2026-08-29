import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Box, Stack, Inline, Container, Text, Heading, VisuallyHidden, type TextCaptionOwnProps } from "@farmsapp/design-system";
import { XIcon, ChevronDownIcon, CheckIcon, LoaderCircleIcon, AlertCircleIcon, EyeIcon, EyeOffIcon, SearchIcon } from "@farmsapp/icons";
import { ThemeProvider, useTheme } from "@farmsapp/themes";
import "@farmsapp/tokens/css";
import "@farmsapp/design-system/css";
import "@farmsapp/icons/css";
import "./demo.css";

/**
 * Box variant gallery — every prop, every value, exercised against a real
 * browser (not just types). Deliberately a permanent playground fixture,
 * not a throwaway probe: playground exists for exactly this ("Internal
 * sandbox for consuming-team dry runs"), and Stack/Inline/Container/Text
 * (Chunks 03-04) inherit anything still wrong with Box, so it's worth
 * catching here before they're built on top of it.
 */

const SPACE_STEPS = ["0", "0-5", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] as const;
const RADIUS_STEPS = ["none", "sm", "md", "lg", "xl", "full"] as const;
const BORDER_WIDTH_STEPS = ["thin", "thick", "heavy"] as const;
const SURFACE_COLORS = ["base", "raised", "sunken", "overlay"] as const;
const BORDER_COLORS = ["subtle", "default", "strong"] as const;
const TEXT_COLORS = ["primary", "secondary", "disabled", "inverse", "danger", "warning", "success"] as const;
const DISPLAY_VALUES = ["block", "inline-block", "flex", "inline-flex", "grid"] as const;
const FLEX_DIRECTIONS = ["row", "column", "row-reverse", "column-reverse"] as const;
const FLEX_WRAPS = ["wrap", "nowrap", "wrap-reverse"] as const;
const ALIGN_ITEMS = ["start", "center", "end", "stretch", "baseline"] as const;
const JUSTIFY_CONTENTS = ["start", "center", "end", "between", "around", "evenly"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box as="section" padding="4" borderColor="subtle" borderWidth="thin" borderRadius="lg" display="flex" flexDirection="column" gap="3">
      <Heading level="2" variant="heading-md" padding="0" color="primary">
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text as="span" variant="caption" color="secondary" padding="0">
      {children}
    </Text>
  );
}

function ThemeToggle() {
  const { theme, setTheme, brand, setBrand } = useTheme();
  return (
    <Box display="flex" gap="2" alignItems="center" padding="2">
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        Theme: {theme} (click to toggle)
      </button>
      <button onClick={() => setBrand(brand ? null : "pilot")}>
        Brand: {brand ?? "default"} (click to toggle)
      </button>
    </Box>
  );
}

function SpacingGallery() {
  return (
    <Section title="Spacing scale — padding (all steps)">
      <Box display="flex" flexWrap="wrap" gap="2">
        {SPACE_STEPS.map((step) => (
          <Box key={step} display="flex" flexDirection="column" alignItems="center" gap="1">
            <Box padding={step} backgroundColor="raised" borderColor="default" borderWidth="thin" borderRadius="sm">
              <Box backgroundColor="sunken" padding="0" className="demo-size-24" />
            </Box>
            <Label>padding={step}</Label>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

function DirectionalSpacingGallery() {
  return (
    <Section title="Directional spacing — paddingTop/Right/Bottom/Left, paddingX/Y, margin + auto">
      <Box display="flex" flexWrap="wrap" gap="3">
        <Box display="flex" flexDirection="column" alignItems="center" gap="1">
          <Box paddingTop="6" paddingRight="1" paddingBottom="1" paddingLeft="1" backgroundColor="raised" borderRadius="sm">
            paddingTop=6
          </Box>
          <Label>paddingTop only</Label>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" gap="1">
          <Box paddingX="6" paddingY="1" backgroundColor="raised" borderRadius="sm">paddingX=6</Box>
          <Label>paddingX only</Label>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" gap="1">
          <Box paddingY="6" paddingX="1" backgroundColor="raised" borderRadius="sm">paddingY=6</Box>
          <Label>paddingY only</Label>
        </Box>
        <Box backgroundColor="sunken" borderRadius="sm" padding="1" className="demo-w-200">
          <Box margin="auto" backgroundColor="raised" borderRadius="sm" padding="2" className="demo-w-60">
            margin=auto
          </Box>
        </Box>
      </Box>
    </Section>
  );
}

function ColorGallery() {
  return (
    <Section title="Semantic color props — backgroundColor / borderColor (Box), color (Text)">
      <Box display="flex" flexDirection="column" gap="2">
        <Box display="flex" flexWrap="wrap" gap="2">
          {SURFACE_COLORS.map((c) => (
            <Box key={c} padding="3" backgroundColor={c} borderColor="strong" borderWidth="thin" borderRadius="md">
              <Text variant="body" color="primary">bg={c}</Text>
            </Box>
          ))}
        </Box>
        <Box display="flex" flexWrap="wrap" gap="2">
          {BORDER_COLORS.map((c) => (
            <Box key={c} padding="3" backgroundColor="base" borderColor={c} borderWidth="thick" borderRadius="md">
              border={c}
            </Box>
          ))}
        </Box>
        <Box display="flex" flexWrap="wrap" gap="2">
          {TEXT_COLORS.map((c) =>
            c === "inverse" ? (
              // No backgroundColor step for this — Box's backgroundColor only
              // exposes surface tokens (base/raised/sunken/overlay), never
              // dark action colors. text.inverse's real, only intended
              // pairing is a solid action background (e.g. a primary
              // button) per semantic-color.json's own description ("text on
              // solid dark backgrounds"). Nothing in Box's current
              // surface-only backgroundColor scope can demonstrate that
              // pairing, so this one swatch reaches past Box's props
              // (a plain className carrying the raw action-primary var())
              // to prove the token itself round-trips correctly — a real,
              // open question about whether Box should eventually expose
              // action-colored backgrounds too, or whether that's Button's
              // job (Phase 7).
              <Box key={c} padding="3" borderRadius="md" className="demo-inverse-swatch-bg">
                <Text variant="body" color={c}>color={c} (bg: action.primary, not a Box prop — see comment)</Text>
              </Box>
            ) : (
              <Box key={c} padding="3" backgroundColor="sunken" borderRadius="md">
                <Text variant="body" color={c}>color={c}</Text>
              </Box>
            ),
          )}
        </Box>
      </Box>
    </Section>
  );
}

function RadiusAndBorderGallery() {
  return (
    <Section title="Radius scale + border-width scale">
      <Box display="flex" flexWrap="wrap" gap="2">
        {RADIUS_STEPS.map((r) => (
          <Box key={r} padding="3" backgroundColor="raised" borderColor="strong" borderWidth="thin" borderRadius={r}>
            radius={r}
          </Box>
        ))}
      </Box>
      <Box display="flex" flexWrap="wrap" gap="2">
        {BORDER_WIDTH_STEPS.map((w) => (
          <Box key={w} padding="3" backgroundColor="raised" borderColor="strong" borderWidth={w} borderRadius="md">
            borderWidth={w}
          </Box>
        ))}
        <Box padding="3" backgroundColor="raised" borderColor="strong" borderRadius="md">
          no borderWidth prop set (should have no visible border)
        </Box>
      </Box>
    </Section>
  );
}

function DisplayAndFlexGallery() {
  return (
    <Section title="display + flexDirection + flexWrap">
      <Box display="flex" flexDirection="column" gap="3">
        {DISPLAY_VALUES.map((d) => (
          <Box key={d} display="flex" alignItems="center" gap="2">
            <Label>display={d}</Label>
            <Box display={d} backgroundColor="sunken" borderRadius="sm" padding="2" gap="1" className="demo-w-240">
              <Box backgroundColor="raised" padding="1" borderRadius="sm">a</Box>
              <Box backgroundColor="raised" padding="1" borderRadius="sm">b</Box>
              <Box backgroundColor="raised" padding="1" borderRadius="sm">c</Box>
            </Box>
          </Box>
        ))}
        {FLEX_DIRECTIONS.map((fd) => (
          <Box key={fd} display="flex" alignItems="center" gap="2">
            <Label>flexDirection={fd}</Label>
            <Box display="flex" flexDirection={fd} gap="1" backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-240 demo-h-90">
              <Box backgroundColor="raised" padding="1" borderRadius="sm">a</Box>
              <Box backgroundColor="raised" padding="1" borderRadius="sm">b</Box>
              <Box backgroundColor="raised" padding="1" borderRadius="sm">c</Box>
            </Box>
          </Box>
        ))}
        {FLEX_WRAPS.map((fw) => (
          <Box key={fw} display="flex" alignItems="center" gap="2">
            <Label>flexWrap={fw}</Label>
            <Box display="flex" flexWrap={fw} gap="1" backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-140">
              {Array.from({ length: 6 }, (_, i) => (
                <Box key={i} backgroundColor="raised" padding="1" borderRadius="sm" className="demo-w-40">
                  {i}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

function AlignJustifyGallery() {
  return (
    <Section title="alignItems + justifyContent">
      <Box display="flex" flexDirection="column" gap="3">
        {ALIGN_ITEMS.map((a) => (
          <Box key={a} display="flex" alignItems="center" gap="2">
            <Label>alignItems={a}</Label>
            <Box display="flex" alignItems={a} gap="1" backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-240 demo-h-70">
              <Box backgroundColor="raised" padding="1" borderRadius="sm" className="demo-h-20">a</Box>
              <Box backgroundColor="raised" padding="1" borderRadius="sm" className="demo-h-40">b</Box>
            </Box>
          </Box>
        ))}
        {JUSTIFY_CONTENTS.map((j) => (
          <Box key={j} display="flex" alignItems="center" gap="2">
            <Label>justifyContent={j}</Label>
            <Box display="flex" justifyContent={j} gap="1" backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-240">
              <Box backgroundColor="raised" padding="1" borderRadius="sm">a</Box>
              <Box backgroundColor="raised" padding="1" borderRadius="sm">b</Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

function GapGallery() {
  return (
    <Section title="gap / rowGap / columnGap">
      <Box display="flex" flexDirection="column" gap="3">
        <Box display="flex" alignItems="center" gap="2">
          <Label>gap=3</Label>
          <Box display="flex" gap="3" backgroundColor="sunken" borderRadius="sm" padding="2">
            <Box backgroundColor="raised" padding="1" borderRadius="sm">a</Box>
            <Box backgroundColor="raised" padding="1" borderRadius="sm">b</Box>
            <Box backgroundColor="raised" padding="1" borderRadius="sm">c</Box>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          <Label>rowGap=4, columnGap=1 (wrapped grid)</Label>
          <Box display="flex" flexWrap="wrap" rowGap="4" columnGap="1" backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-120">
            {Array.from({ length: 4 }, (_, i) => (
              <Box key={i} backgroundColor="raised" padding="1" borderRadius="sm" className="demo-w-40">
                {i}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Section>
  );
}

function ResponsiveGallery() {
  return (
    <Section title="Responsive props — resize the window (md=600px, lg=1024px)">
      <Box padding={{ base: "1", md: "4", lg: "8" }} backgroundColor="raised" borderRadius="md">
        padding: base=1, md=4, lg=8
      </Box>
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: "1", lg: "4" }}
        backgroundColor="sunken"
        borderRadius="md"
        padding="2"
      >
        <Box backgroundColor="raised" padding="2" borderRadius="sm">column below md, row at/above md</Box>
        <Box backgroundColor="raised" padding="2" borderRadius="sm">gap=1 below lg, gap=4 at/above lg</Box>
      </Box>
    </Section>
  );
}

function PolymorphismGallery() {
  return (
    <Section title="Polymorphic `as` — allowed tags + one intentional dev-warning">
      <Box display="flex" flexDirection="column" gap="2">
        <Box as="ul" padding="0" display="flex" flexDirection="column" gap="1">
          <Box as="li" padding="2" backgroundColor="raised" borderRadius="sm">
            as=&quot;ul&quot; / as=&quot;li&quot;
          </Box>
        </Box>
        <Box as="span" padding="2" backgroundColor="raised" borderRadius="sm" className="demo-inline-block">
          as=&quot;span&quot;
        </Box>
        <Box as="button" padding="2" backgroundColor="raised" borderRadius="sm">
          as=&quot;button&quot; — check devtools console for the allowlist warning
        </Box>
      </Box>
    </Section>
  );
}

function ComposedExample() {
  return (
    <Section title="Composed example — a card-like layout, dogfooding everything above">
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        gap="3"
        padding="3"
        backgroundColor="raised"
        borderColor="default"
        borderWidth="thin"
        borderRadius="lg"
        className="demo-max-w-480"
      >
        <Box backgroundColor="sunken" borderRadius="md" className="demo-w-96 demo-h-96 demo-flex-shrink-0" />
        <Box display="flex" flexDirection="column" gap="1">
          {/* "strong" isn't in Text's as union (decisions/decision-text-as-tag-and-variant-narrowed.md)
              — weight="semibold" gets the same visual emphasis within it. */}
          <Text variant="body" weight="semibold" color="primary" padding="0">
            Card title
          </Text>
          <Text variant="body" color="secondary" padding="0">
            Card body text, using color=secondary for the deemphasized read.
          </Text>
          <Box display="flex" gap="2" marginTop="2">
            <Box as="button" paddingX="3" paddingY="1" backgroundColor="base" borderColor="strong" borderWidth="thin" borderRadius="sm">
              Action
            </Box>
          </Box>
        </Box>
      </Box>
    </Section>
  );
}

function StackGallery() {
  return (
    <Section title="Stack — flex column, gap required">
      <Stack gap="2" backgroundColor="sunken" borderRadius="sm" padding="2">
        <Box backgroundColor="raised" padding="2" borderRadius="sm">one</Box>
        <Box backgroundColor="raised" padding="2" borderRadius="sm">two</Box>
        <Box backgroundColor="raised" padding="2" borderRadius="sm">three</Box>
      </Stack>
    </Section>
  );
}

function InlineGallery() {
  return (
    <Section title="Inline — flex row, gap required, wrap toggle">
      <Box display="flex" flexDirection="column" gap="3">
        <Box display="flex" alignItems="center" gap="2">
          <Label>wrap=false (default) — overflows rather than reflow</Label>
          <Inline gap="2" backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-200 demo-overflow-hidden">
            {["one", "two", "three", "four", "five"].map((t) => (
              <Box key={t} backgroundColor="raised" padding="2" borderRadius="sm" className="demo-flex-shrink-0">
                {t}
              </Box>
            ))}
          </Inline>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          <Label>wrap=true — reflows onto new lines</Label>
          <Inline gap="2" wrap backgroundColor="sunken" borderRadius="sm" padding="2" className="demo-w-200">
            {["one", "two", "three", "four", "five"].map((t) => (
              <Box key={t} backgroundColor="raised" padding="2" borderRadius="sm">
                {t}
              </Box>
            ))}
          </Inline>
        </Box>
      </Box>
    </Section>
  );
}

function ContainerGallery() {
  return (
    <Section title="Container — maxWidth scale + centering">
      <Box display="flex" flexDirection="column" gap="2" backgroundColor="sunken" borderRadius="sm" padding="2">
        {(["sm", "md", "lg", "xl", "full"] as const).map((mw) => (
          <Container key={mw} maxWidth={mw} backgroundColor="raised" borderColor="strong" borderWidth="thin" borderRadius="sm" padding="2">
            maxWidth={mw}
          </Container>
        ))}
      </Box>
    </Section>
  );
}

function TextGallery() {
  const TEXT_VARIANTS = ["body", "caption"] as const;
  const TEXT_WEIGHTS = ["regular", "medium", "semibold"] as const;
  const TEXT_SIZES = ["xsmall", "small", "medium", "large", "xlarge", "2xlarge"] as const;
  const TEXT_DECORATIONS = ["none", "underline", "line-through", "dotted"] as const;
  const WORD_BREAKS = ["normal", "break-all", "keep-all", "break-word"] as const;
  const TEXT_ALIGNS = ["left", "center", "right", "justify"] as const;
  const TEXT_TRANSFORMS = ["none", "capitalize", "uppercase", "lowercase"] as const;
  return (
    <Section title="Text — variant scale + letterSpacing + lang">
      <Box display="flex" flexDirection="column" gap="2">
        {TEXT_VARIANTS.map((v) => (
          <Box key={v} display="flex" alignItems="center" gap="2">
            <Label>variant={v}</Label>
            <Text variant={v}>The quick brown fox jumps over the lazy dog.</Text>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Box display="flex" alignItems="center" gap="2">
          <Label>letterSpacing=tight (Latin, lang unset)</Label>
          <Text variant="body" letterSpacing="tight">Tracked text — English only.</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          <Label>lang=&quot;hi&quot; + letterSpacing=&quot;tight&quot; — guard should force it to normal (check console)</Label>
          <Text variant="body" letterSpacing="tight" lang="hi">नमस्ते दुनिया — देवनागरी पाठ।</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          <Label>lang=&quot;hi&quot; alone, no letterSpacing override — no warning expected</Label>
          <Text variant="body" lang="hi">नमस्ते दुनिया — देवनागरी पाठ, बिना ट्रैकिंग के।</Text>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {TEXT_WEIGHTS.map((w) => (
          <Box key={w} display="flex" alignItems="center" gap="2">
            <Label>weight={w}</Label>
            <Text variant="body" weight={w}>The quick brown fox jumps over the lazy dog.</Text>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap="2">
          <Label>
            variant=&quot;caption&quot; + weight=&quot;semibold&quot; (bypassing the type guard) — captions are always
            weight &quot;regular&quot;, guard should ignore it (check console + computed font-weight stays 500, caption&apos;s own weight)
          </Label>
          <Text {...({ variant: "caption", weight: "semibold" } as TextCaptionOwnProps)}>Caption text, forced weight ignored.</Text>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {TEXT_SIZES.map((s) => (
          <Box key={s} display="flex" alignItems="center" gap="2">
            <Label>size={s}</Label>
            <Text variant="body" size={s}>The quick brown fox jumps over the lazy dog.</Text>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap="2">
          <Label>variant=&quot;caption&quot; + size=&quot;small&quot; — caption&apos;s own scoped size range, size should win over caption&apos;s own default (check computed style)</Label>
          <Text variant="caption" size="small">Caption text, stepped up within its own scale.</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          <Label>
            variant=&quot;caption&quot; + size=&quot;2xlarge&quot; (bypassing the type guard, simulating a non-TypeScript caller) — out of
            caption&apos;s scoped range, guard should ignore it and fall back to caption&apos;s own default size (check console)
          </Label>
          <Text {...({ variant: "caption", size: "2xlarge" } as unknown as TextCaptionOwnProps)}>Caption text, invalid size ignored.</Text>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {TEXT_DECORATIONS.map((d) => (
          <Box key={d} display="flex" alignItems="center" gap="2">
            <Label>textDecorationLine={d}</Label>
            <Text variant="body" textDecorationLine={d}>The quick brown fox jumps over the lazy dog.</Text>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {WORD_BREAKS.map((wb) => (
          <Box key={wb} display="flex" alignItems="center" gap="2">
            <Label>wordBreak={wb}</Label>
            <Text variant="body" wordBreak={wb} className="demo-w-200">Supercalifragilisticexpialidocious antidisestablishmentarianism</Text>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {TEXT_ALIGNS.map((ta) => (
          <Box key={ta} display="flex" alignItems="center" gap="2">
            <Label>textAlign={ta}</Label>
            <Text variant="body" textAlign={ta} className="demo-w-200">Aligned text sample.</Text>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {TEXT_TRANSFORMS.map((tt) => (
          <Box key={tt} display="flex" alignItems="center" gap="2">
            <Label>textTransform={tt}</Label>
            <Text variant="body" textTransform={tt}>The Quick Brown Fox</Text>
          </Box>
        ))}
      </Box>
      <Box display="flex" alignItems="center" gap="2" marginTop="3">
        <Label>truncateAfterLines=2</Label>
        <Text variant="body" truncateAfterLines={2} className="demo-w-200">
          This is a deliberately long sentence meant to wrap across several lines so the truncateAfterLines line-clamp behavior actually has something real to clip in the browser check.
        </Text>
      </Box>
    </Section>
  );
}

function HeadingGallery() {
  const HEADING_VARIANTS = ["display", "heading-lg", "heading-md", "heading-sm"] as const;
  const HEADING_WEIGHTS = ["regular", "medium", "semibold"] as const;
  const HEADING_DECORATIONS = ["none", "underline", "line-through", "dotted"] as const;
  const HEADING_WORD_BREAKS = ["normal", "break-all", "keep-all", "break-word"] as const;
  const HEADING_ALIGNS = ["left", "center", "right", "justify"] as const;
  const HEADING_TRANSFORMS = ["none", "capitalize", "uppercase", "lowercase"] as const;
  return (
    <Section title="Heading — level/variant decoupled (real tag vs visual size, independently)">
      <Box display="flex" flexDirection="column" gap="2">
        {HEADING_VARIANTS.map((v, i) => (
          <Box key={v} display="flex" alignItems="center" gap="2">
            <Label>level={String(i + 1)}, variant={v} (matched, the common case)</Label>
            <Heading level={String(i + 1) as "1" | "2" | "3" | "4"} variant={v}>Heading sample</Heading>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Box display="flex" alignItems="center" gap="2">
          <Label>level=2 (real &lt;h2&gt;) but variant=&quot;display&quot; — visually huge, structurally still an h2</Label>
          <Heading level="2" variant="display">Deliberately mismatched heading</Heading>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          <Label>level=1 (real &lt;h1&gt;) but variant=&quot;heading-sm&quot; — visually modest, structurally still an h1</Label>
          <Heading level="1" variant="heading-sm">Modest-looking h1</Heading>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {HEADING_WEIGHTS.map((w) => (
          <Box key={w} display="flex" alignItems="center" gap="2">
            <Label>level=3, variant=&quot;heading-md&quot;, weight={w}</Label>
            <Heading level="3" variant="heading-md" weight={w}>Weighted heading</Heading>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap="2">
          <Label>level=1, variant=&quot;display&quot;, no weight override — should stay bold (700), not display&apos;s own semibold-default sibling variants</Label>
          <Heading level="1" variant="display">Display heading, own default weight</Heading>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {HEADING_DECORATIONS.map((d) => (
          <Box key={d} display="flex" alignItems="center" gap="2">
            <Label>level=4, variant=&quot;heading-sm&quot;, textDecorationLine={d}</Label>
            <Heading level="4" variant="heading-sm" textDecorationLine={d}>Decorated heading</Heading>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {HEADING_WORD_BREAKS.map((wb) => (
          <Box key={wb} display="flex" alignItems="center" gap="2">
            <Label>level=4, variant=&quot;heading-sm&quot;, wordBreak={wb}</Label>
            <Heading level="4" variant="heading-sm" wordBreak={wb} className="demo-w-200">Supercalifragilisticexpialidocious</Heading>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {HEADING_ALIGNS.map((ta) => (
          <Box key={ta} display="flex" alignItems="center" gap="2">
            <Label>level=4, variant=&quot;heading-sm&quot;, textAlign={ta}</Label>
            <Heading level="4" variant="heading-sm" textAlign={ta} className="demo-w-200">Aligned heading</Heading>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        {HEADING_TRANSFORMS.map((tt) => (
          <Box key={tt} display="flex" alignItems="center" gap="2">
            <Label>level=4, variant=&quot;heading-sm&quot;, textTransform={tt}</Label>
            <Heading level="4" variant="heading-sm" textTransform={tt}>The Quick Brown Fox</Heading>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

function VisuallyHiddenGallery() {
  return (
    <Section title="VisuallyHidden — present in the DOM/accessibility tree, never visually rendered">
      <Box display="flex" alignItems="center" gap="2">
        <Label>Plain native &lt;button&gt; whose only accessible name comes from a nested VisuallyHidden — verifies the technique for real, not just visually</Label>
        {/* A plain native button, not the not-yet-built Button primitive —
            deliberately, per decisions/decision-visually-hidden-minimal-scope.md's
            own verification plan. The "×" is purely decorative/visual; the
            real accessible name comes entirely from the hidden text. */}
        <button type="button">
          <span aria-hidden="true">×</span>
          <VisuallyHidden>Close dialog</VisuallyHidden>
        </button>
      </Box>
      <Box display="flex" alignItems="center" gap="2" marginTop="2">
        <Label>The same text, unhidden, for visual comparison — should read identically to a screen reader, look completely different to the eye</Label>
        <Text variant="body">Close dialog</Text>
      </Box>
    </Section>
  );
}

function IconGallery() {
  const ICON_SIZES = ["small", "medium", "large"] as const;
  const ICON_COLORS = ["primary", "secondary", "disabled", "inverse", "danger", "warning", "success"] as const;
  const ALL_ICONS = [
    ["XIcon", XIcon],
    ["ChevronDownIcon", ChevronDownIcon],
    ["CheckIcon", CheckIcon],
    ["LoaderCircleIcon", LoaderCircleIcon],
    ["AlertCircleIcon", AlertCircleIcon],
    ["EyeIcon", EyeIcon],
    ["EyeOffIcon", EyeOffIcon],
    ["SearchIcon", SearchIcon],
  ] as const;
  return (
    <Section title="Icon — Lucide-sourced, aria-hidden unconditional, size/color reuse existing tokens">
      <Box display="flex" flexWrap="wrap" gap="3">
        {ALL_ICONS.map(([name, IconComponent]) => (
          <Box key={name} display="flex" flexDirection="column" alignItems="center" gap="1">
            <IconComponent />
            <Label>{name}</Label>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexWrap="wrap" gap="3" marginTop="3">
        {ICON_SIZES.map((s) => (
          <Box key={s} display="flex" flexDirection="column" alignItems="center" gap="1">
            <XIcon size={s} />
            <Label>size={s}</Label>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexWrap="wrap" gap="3" marginTop="3">
        {ICON_COLORS.map((c) =>
          c === "inverse" ? (
            <Box key={c} display="flex" flexDirection="column" alignItems="center" gap="1" backgroundColor="sunken" padding="2" borderRadius="sm" className="demo-inverse-swatch-bg">
              <AlertCircleIcon color={c} />
              <Label>color={c} (on action bg)</Label>
            </Box>
          ) : (
            <Box key={c} display="flex" flexDirection="column" alignItems="center" gap="1">
              <AlertCircleIcon color={c} />
              <Label>color={c}</Label>
            </Box>
          ),
        )}
      </Box>
      <Box display="flex" alignItems="center" gap="2" marginTop="3">
        <Label>No color prop, nested inside &lt;Text color=&quot;danger&quot;&gt; — icon should inherit currentColor from its ancestor, not stay unstyled</Label>
        <Text color="danger">
          <SearchIcon /> inherits danger via currentColor
        </Text>
      </Box>
    </Section>
  );
}

function App() {
  const [renderCount, setRenderCount] = useState(0);
  return (
    <ThemeProvider>
      <Box
        as="div"
        padding="4"
        display="flex"
        flexDirection="column"
        gap="4"
        className="demo-max-w-960-centered"
      >
        {/* No color/backgroundColor here anymore — @farmsapp/design-system's
            new base.css now sets both on <body> (theme-aware, via
            var(--ds-color-text-primary)/var(--ds-color-surface-base)), and
            `color` inherits from there through this transparent wrapper down
            to every nested Box/Text/Heading below, exactly like the former
            per-page workaround did manually. See
            decisions/decision-base-reset-stylesheet.md. This wrapper is back
            to a plain Box (no longer needs to be a Text) since it no longer
            sets `color` itself. */}
        <Heading level="1" variant="heading-lg" padding="1" marginTop={"0"} color="secondary" backgroundColor="raised">
          Box variant gallery
        </Heading>
        <ThemeToggle />
        <button onClick={() => setRenderCount((n) => n + 1)}>Force re-render ({renderCount})</button>
        <SpacingGallery />
        <DirectionalSpacingGallery />
        <ColorGallery />
        <RadiusAndBorderGallery />
        <DisplayAndFlexGallery />
        <AlignJustifyGallery />
        <GapGallery />
        <ResponsiveGallery />
        <PolymorphismGallery />
        <ComposedExample />
        <StackGallery />
        <InlineGallery />
        <ContainerGallery />
        <TextGallery />
        <HeadingGallery />
        <VisuallyHiddenGallery />
        <IconGallery />
      </Box>
    </ThemeProvider>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
