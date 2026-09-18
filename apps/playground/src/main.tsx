import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Box, Stack, Inline, Container, Text, Heading, VisuallyHidden, Spinner, Button, IconButton, Tooltip, TooltipInteractiveWrapper, Popover, PopoverInteractiveWrapper, Tabs, TabList, TabItem, TabPanel, Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, type TextCaptionOwnProps } from "@farmsapp/design-system";
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

function SpinnerGallery() {
  const SPINNER_SIZES = ["small", "medium", "large"] as const;
  return (
    <Section title="Spinner — wraps LoaderCircleIcon, CSS rotation, role=status accessible name">
      <Box display="flex" flexWrap="wrap" gap="3">
        {SPINNER_SIZES.map((s) => (
          <Box key={s} display="flex" flexDirection="column" alignItems="center" gap="1">
            <Spinner size={s} accessibilityLabel="Loading" />
            <Label>size={s}</Label>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

function ButtonGallery() {
  const BUTTON_VARIANTS = ["primary", "secondary", "tertiary"] as const;
  const BUTTON_SIZES = ["xsmall", "small", "medium", "large"] as const;
  const [loading, setLoading] = useState(false);
  return (
    <Section title="Button — BaseButton/Button split, variant + size + disabled/loading + icon combos">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>variant (primary/secondary/tertiary)</Label>
        <Box display="flex" gap="2" flexWrap="wrap">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>size (xsmall/small/medium/large)</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          {BUTTON_SIZES.map((s) => (
            <Button key={s} size={s}>{`size ${s}`}</Button>
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>isDisabled — click should no-op, no hover feedback</Label>
        <Box display="flex" gap="2" flexWrap="wrap">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v} isDisabled onClick={() => alert("should never fire")}>{`disabled ${v}`}</Button>
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>icon + iconPosition (left/right)</Label>
        <Box display="flex" gap="2" flexWrap="wrap">
          <Button aria-controls='id' icon={SearchIcon} iconPosition="left">
            Search
          </Button>
          <Button icon={ChevronDownIcon} iconPosition="right" variant="secondary">
            More
          </Button>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>icon-only — requires accessibilityLabel (aria-label, not VisuallyHidden)</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          {BUTTON_SIZES.map((s) => (
            <Button key={s} size={s} icon={XIcon} accessibilityLabel="Close" variant="tertiary" />
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>isLoading — toggle, content hidden not unmounted (no layout shift), Spinner overlay</Label>
        <Box display="flex" gap="2" alignItems="center">
          <Button icon={CheckIcon} isLoading={loading}>
            Submit
          </Button>
          <Button size="small" variant="tertiary" onClick={() => setLoading((v) => !v)}>
            Toggle loading
          </Button>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>isFullWidth</Label>
        <Box className="demo-w-320">
          <Button isFullWidth variant="secondary">
            Full width
          </Button>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>
          href — renders as real &lt;a&gt;. isDisabled is deliberately ignored on a link (matches Blade&apos;s real, confirmed behavior —
          a link-rendered button can&apos;t be truly disabled without breaking link semantics), so this one below still opens on click.
        </Label>
        <Box display="flex" gap="2" flexWrap="wrap">
          <Button href="https://example.com" target="_blank" rel="noreferrer">
            Real link
          </Button>
          <Button href="https://example.com" target="_blank" rel="noreferrer" isDisabled>
            isDisabled + href (still opens — see label above)
          </Button>
        </Box>
      </Box>
    </Section>
  );
}

function IconButtonGallery() {
  const EMPHASES = ["subtle", "intense", "moderate"] as const;
  const SIZES = ["small", "medium", "large"] as const;
  return (
    <Section title="IconButton — genuinely separate from Button, emphasis + isHighlighted model">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>emphasis (subtle/intense/moderate) — moderate shows a persistent background, subtle/intense stay transparent</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          {EMPHASES.map((e) => (
            <IconButton key={e} emphasis={e} icon={XIcon} accessibilityLabel={`emphasis ${e}`} />
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>isHighlighted — transparent at rest, gains a background container on hover/focus</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          <IconButton isHighlighted icon={SearchIcon} accessibilityLabel="Search (highlighted)" />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>size (small/medium/large)</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          {SIZES.map((s) => (
            <IconButton key={s} size={s} icon={CheckIcon} accessibilityLabel={`size ${s}`} />
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>size=&quot;large&quot; + isHighlighted — no large container exists; falls back to no container (check console for the dev warning)</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          <IconButton size="large" isHighlighted icon={AlertCircleIcon} accessibilityLabel="large highlighted (falls back)" />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>isDisabled — real disabled attribute, no click, no hover feedback</Label>
        <Box display="flex" gap="2" flexWrap="wrap" alignItems="center">
          <IconButton isDisabled icon={ChevronDownIcon} accessibilityLabel="Disabled icon button" onClick={() => alert("should never fire")} />
        </Box>
      </Box>
    </Section>
  );
}

function TooltipGallery() {
  const [controlledOpen, setControlledOpen] = useState(false);
  return (
    <Section title="Tooltip — floating-ui, aria-describedby, real useDismiss (Escape/click-outside)">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>Hover/focus a real Button trigger (300ms open delay, 100ms close delay, immediate on keyboard focus)</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Tooltip content="Hello world">
            <Button variant="secondary">Hover or Tab to me</Button>
          </Tooltip>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>title + content, placement=&quot;bottom-start&quot;</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Tooltip title="Refunds" content="Refunds typically take 5-7 business days to process." placement="bottom-start">
            <Button variant="tertiary">Titled tooltip</Button>
          </Tooltip>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>IconButton trigger — aria-describedby composes with IconButton&apos;s own required accessibilityLabel (check accessibility tree: both name AND description present)</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Tooltip content="Search records" placement="top">
            <IconButton icon={SearchIcon} accessibilityLabel="Search records action" />
          </Tooltip>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Non-interactive trigger (plain Icon) — requires TooltipInteractiveWrapper</Label>
        <Box display="flex" gap="4" flexWrap="wrap" alignItems="center">
          <Tooltip content="This field is required">
            <TooltipInteractiveWrapper>
              <AlertCircleIcon color="warning" />
            </TooltipInteractiveWrapper>
          </Tooltip>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Controlled (isOpen/onOpenChange) — external toggle button</Label>
        <Box display="flex" gap="2" alignItems="center">
          <Tooltip content="Controlled tooltip" isOpen={controlledOpen} onOpenChange={setControlledOpen}>
            <Button variant="primary">Controlled trigger</Button>
          </Tooltip>
          {/* Two explicit buttons, not one functional-updater toggle — a
              functional toggle here races with useDismiss's own real
              outsidePress close (a native pointerdown listener that fires
              before React's synthetic onClick): clicking this button while
              the tooltip is open is itself an "outside click", so dismiss
              closes it first, then the toggle's (v) => !v update — queued
              in the same batch — flips it back open, netting no visible
              change. Setting state explicitly sidesteps the race entirely. */}
          <Button size="small" variant="tertiary" onClick={() => setControlledOpen(true)}>
            Open externally
          </Button>
          <Button size="small" variant="tertiary" onClick={() => setControlledOpen(false)}>
            Close externally
          </Button>
        </Box>
      </Box>
    </Section>
  );
}

function PopoverGallery() {
  const [controlledOpen, setControlledOpen] = useState(false);
  const PLACEMENTS = ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] as const;
  return (
    <Section title="Popover — floating-ui, click-triggered, focus trap, dismiss">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>Default — no title/titleLeading, close button floats top-right</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Popover content={<Text variant="body">Popover content goes here.</Text>}>
            <Button variant="secondary">Click me</Button>
          </Popover>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>title + titleLeading, placement=&quot;bottom-start&quot;</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Popover
            title="Refund policy"
            titleLeading={<AlertCircleIcon color="warning" />}
            content={<Text variant="body">Refunds typically take 5-7 business days to process.</Text>}
            placement="bottom-start"
          >
            <Button variant="tertiary">Titled popover</Button>
          </Popover>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>placement — each button should open its popover right next to itself, in the requested direction</Label>
        <Box display="flex" gap="6" flexWrap="wrap" className="demo-max-w-960-centered">
          {PLACEMENTS.map((placement) => (
            <Popover key={placement} content={<Text variant="body">{placement}</Text>} placement={placement}>
              <Button variant="secondary">{placement}</Button>
            </Popover>
          ))}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>IconButton trigger — already focusable, no wrapper needed</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Popover content={<Text variant="body">Search across all records.</Text>}>
            <IconButton icon={SearchIcon} accessibilityLabel="Search" />
          </Popover>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Non-interactive trigger (plain Icon) — requires PopoverInteractiveWrapper</Label>
        <Box display="flex" gap="4" flexWrap="wrap" alignItems="center">
          <Popover content={<Text variant="body">This field is required.</Text>}>
            <PopoverInteractiveWrapper aria-label="Field info">
              <AlertCircleIcon color="warning" />
            </PopoverInteractiveWrapper>
          </Popover>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>footer — rendered as-is below the body</Label>
        <Box display="flex" gap="4" flexWrap="wrap">
          <Popover
            title="Delete item"
            content={<Text variant="body">This action can&apos;t be undone.</Text>}
            footer={
              <Inline gap="2">
                <Button size="small" variant="tertiary">
                  Cancel
                </Button>
                <Button size="small" variant="primary">
                  Delete
                </Button>
              </Inline>
            }
          >
            <Button variant="secondary">Open with footer</Button>
          </Popover>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Controlled (isOpen/onOpenChange) — external toggle buttons</Label>
        <Box display="flex" gap="2" alignItems="center">
          <Popover content={<Text variant="body">Controlled popover</Text>} isOpen={controlledOpen} onOpenChange={setControlledOpen}>
            <Button variant="primary">Controlled trigger</Button>
          </Popover>
          <Button size="small" variant="tertiary" onClick={() => setControlledOpen(true)}>
            Open externally
          </Button>
          <Button size="small" variant="tertiary" onClick={() => setControlledOpen(false)}>
            Close externally
          </Button>
        </Box>
      </Box>
    </Section>
  );
}

function TabsGallery() {
  const [lazyMounted, setLazyMounted] = useState<string[]>([]);
  return (
    <Section title="Tabs — Composite-driven keyboard nav, animated indicator, isLazy panels">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>variant=&quot;bordered&quot; (default) — arrow keys/Home/End to navigate, click or focus to select</Label>
        <Tabs defaultValue="account">
          <TabList>
            <TabItem value="account">Account</TabItem>
            <TabItem value="security">Security</TabItem>
            <TabItem value="notifications" isDisabled>
              Notifications (disabled)
            </TabItem>
            <TabItem value="billing">Billing</TabItem>
          </TabList>
          <TabPanel value="account">
            <Text as="p" padding="2">Account settings panel.</Text>
          </TabPanel>
          <TabPanel value="security">
            <Text as="p" padding="2">Security settings panel.</Text>
          </TabPanel>
          <TabPanel value="notifications">
            <Text as="p" padding="2">Notifications settings panel.</Text>
          </TabPanel>
          <TabPanel value="billing">
            <Text as="p" padding="2">Billing settings panel.</Text>
          </TabPanel>
        </Tabs>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>variant=&quot;filled&quot;, icon + label tabs, isFullWidthTabItem</Label>
        <Tabs defaultValue="search" variant="filled" isFullWidthTabItem>
          <TabList>
            <TabItem value="search" leading={SearchIcon}>
              Search
            </TabItem>
            <TabItem value="verify" leading={CheckIcon}>
              Verify
            </TabItem>
          </TabList>
          <TabPanel value="search">
            <Text as="p" padding="2">Search panel.</Text>
          </TabPanel>
          <TabPanel value="verify">
            <Text as="p" padding="2">Verify panel.</Text>
          </TabPanel>
        </Tabs>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>variant=&quot;borderless&quot;, orientation=&quot;vertical&quot;</Label>
        <Box display="flex">
          <Tabs defaultValue="one" variant="borderless" orientation="vertical">
            <TabList>
              <TabItem value="one">One</TabItem>
              <TabItem value="two">Two</TabItem>
              <TabItem value="three">Three</TabItem>
            </TabList>
            <Box marginLeft="4">
              <TabPanel value="one">
                <Text as="p">Vertical panel one.</Text>
              </TabPanel>
              <TabPanel value="two">
                <Text as="p">Vertical panel two.</Text>
              </TabPanel>
              <TabPanel value="three">
                <Text as="p">Vertical panel three.</Text>
              </TabPanel>
            </Box>
          </Tabs>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>isLazy — panel children only mount after first selection (mounted so far: {lazyMounted.join(", ") || "none"})</Label>
        <Tabs
          defaultValue="lazy-a"
          isLazy
          onChange={(value) => setLazyMounted((prev) => (prev.includes(value) ? prev : [...prev, value]))}
        >
          <TabList>
            <TabItem value="lazy-a">Lazy A</TabItem>
            <TabItem value="lazy-b">Lazy B</TabItem>
          </TabList>
          <TabPanel value="lazy-a">
            <Text as="p" padding="2">Lazy A mounted.</Text>
          </TabPanel>
          <TabPanel value="lazy-b">
            <Text as="p" padding="2">Lazy B mounted.</Text>
          </TabPanel>
        </Tabs>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Link-as-tab (real &lt;a href&gt;, still keyboard-navigable via Composite)</Label>
        <Tabs defaultValue="ext">
          <TabList>
            <TabItem value="ext" href="#tabs-gallery">
              External-style link tab
            </TabItem>
            <TabItem value="normal">Normal tab</TabItem>
          </TabList>
          <TabPanel value="ext">
            <Text as="p" padding="2">Reached via link-as-tab.</Text>
          </TabPanel>
          <TabPanel value="normal">
            <Text as="p" padding="2">Normal panel.</Text>
          </TabPanel>
        </Tabs>
      </Box>
    </Section>
  );
}

function CheckboxGallery() {
  const [selectAll, setSelectAll] = useState<string[]>(["apple"]);
  const fruits = ["apple", "banana", "cherry"];
  const isAllSelected = selectAll.length === fruits.length;
  const isPartiallySelected = selectAll.length > 0 && !isAllSelected;
  return (
    <Section title="Checkbox — real :checked/:indeterminate CSS, shared Selector primitive">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>Sizes (small/medium/large), default unchecked</Label>
        <Box display="flex" gap="4" alignItems="center">
          <Checkbox size="small">Small</Checkbox>
          <Checkbox size="medium">Medium</Checkbox>
          <Checkbox size="large">Large</Checkbox>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Checked, indeterminate, disabled, disabled+checked</Label>
        <Box display="flex" gap="4" alignItems="center">
          <Checkbox defaultChecked>Checked</Checkbox>
          <Checkbox isIndeterminate>Indeterminate</Checkbox>
          <Checkbox isDisabled>Disabled</Checkbox>
          <Checkbox isDisabled defaultChecked>
            Disabled + checked
          </Checkbox>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>validationState=&quot;error&quot; with errorText</Label>
        <Checkbox validationState="error" errorText="You must accept the terms to continue.">
          I accept the terms
        </Checkbox>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>
          CheckboxGroup — &quot;select all&quot; indeterminate is NOT automatic (Blade&apos;s real behavior); computed
          manually here from the group&apos;s own children state
        </Label>
        <Checkbox
          isIndeterminate={isPartiallySelected}
          isChecked={isAllSelected}
          onChange={({ isChecked }) => setSelectAll(isChecked ? fruits : [])}
        >
          Select all
        </Checkbox>
        <CheckboxGroup label="Favorite fruits" value={selectAll} onChange={({ values }) => setSelectAll(values)}>
          {fruits.map((fruit) => (
            <Checkbox key={fruit} value={fruit}>
              {fruit.charAt(0).toUpperCase() + fruit.slice(1)}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>CheckboxGroup, orientation=&quot;horizontal&quot;, group-level isDisabled</Label>
        <CheckboxGroup label="Notification channels (disabled)" orientation="horizontal" isDisabled defaultValue={["email"]}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
          <Checkbox value="push">Push</Checkbox>
        </CheckboxGroup>
      </Box>
    </Section>
  );
}

function RadioGallery() {
  const [plan, setPlan] = useState("basic");
  return (
    <Section title="Radio — always group-controlled, native <input type=&quot;radio&quot; name=&quot;...&quot;> grouping">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>Sizes (small/medium/large)</Label>
        <RadioGroup label="Size demo" orientation="horizontal" defaultValue="medium">
          <Radio value="small" size="small">
            Small
          </Radio>
          <Radio value="medium" size="medium">
            Medium
          </Radio>
          <Radio value="large" size="large">
            Large
          </Radio>
        </RadioGroup>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>
          Real grouped example — arrow keys move selection between radios natively (try Tab then Arrow Down/Up), a
          per-Radio isDisabled, and trailing content
        </Label>
        <RadioGroup label="Choose a plan" value={plan} onChange={({ value }) => setPlan(value)}>
          <Radio value="basic" trailing={<Text as="span" size="xsmall" color="secondary">Free</Text>}>
            Basic
          </Radio>
          <Radio value="pro" trailing={<Text as="span" size="xsmall" color="secondary">₹499/mo</Text>}>
            Pro
          </Radio>
          <Radio value="enterprise" isDisabled trailing={<Text as="span" size="xsmall" color="secondary">Contact us</Text>}>
            Enterprise (disabled)
          </Radio>
        </RadioGroup>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>validationState=&quot;error&quot; with errorText, group-level isDisabled</Label>
        <RadioGroup label="Payment method" validationState="error" errorText="Select a payment method to continue.">
          <Radio value="upi">UPI</Radio>
          <Radio value="card">Card</Radio>
        </RadioGroup>
        <RadioGroup label="Disabled group" isDisabled defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      </Box>
    </Section>
  );
}

function SwitchGallery() {
  const [notifications, setNotifications] = useState(true);
  return (
    <Section title="Switch — role=&quot;switch&quot;, real nested track/thumb/icon, press-and-stretch effect">
      <Box display="flex" flexDirection="column" gap="2">
        <Label>Sizes (small/medium), both label modes</Label>
        <Box display="flex" gap="4" alignItems="center">
          <Switch size="small" accessibilityLabel="Small switch, no visible text" />
          <Switch size="medium">Medium, with visible label</Switch>
          <Switch size="medium" defaultChecked>
            Defaults checked
          </Switch>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Disabled (unchecked / checked)</Label>
        <Box display="flex" gap="4" alignItems="center">
          <Switch isDisabled>Disabled</Switch>
          <Switch isDisabled defaultChecked>
            Disabled + checked
          </Switch>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" gap="2" marginTop="3">
        <Label>Controlled — try Space/pointer press-and-hold to see the thumb stretch</Label>
        <Switch isChecked={notifications} onChange={({ isChecked }) => setNotifications(isChecked)}>
          {`Notifications ${notifications ? "on" : "off"}`}
        </Switch>
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
        <SpinnerGallery />
        <ButtonGallery />
        <IconButtonGallery />
        <TooltipGallery />
        <PopoverGallery />
        <TabsGallery />
        <CheckboxGallery />
        <RadioGallery />
        <SwitchGallery />
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
