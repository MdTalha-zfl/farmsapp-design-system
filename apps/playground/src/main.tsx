import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Box, Stack, Inline, Container } from "@farmsapp/design-system";
import { ThemeProvider, useTheme } from "@farmsapp/themes";
import "@farmsapp/tokens/css";
import "@farmsapp/design-system/css";
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
const TEXT_COLORS = ["primary", "secondary", "disabled", "inverse"] as const;
const DISPLAY_VALUES = ["block", "inline-block", "flex", "inline-flex", "grid"] as const;
const FLEX_DIRECTIONS = ["row", "column", "row-reverse", "column-reverse"] as const;
const FLEX_WRAPS = ["wrap", "nowrap", "wrap-reverse"] as const;
const ALIGN_ITEMS = ["start", "center", "end", "stretch", "baseline"] as const;
const JUSTIFY_CONTENTS = ["start", "center", "end", "between", "around", "evenly"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box as="section" padding="4" borderColor="subtle" borderWidth="thin" borderRadius="lg" display="flex" flexDirection="column" gap="3">
      <Box as="h2" padding="0" color="primary">
        {title}
      </Box>
      {children}
    </Box>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Box as="span" color="secondary" padding="0">
      {children}
    </Box>
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
    <Section title="Semantic color props — backgroundColor / borderColor / color">
      <Box display="flex" flexDirection="column" gap="2">
        <Box display="flex" flexWrap="wrap" gap="2">
          {SURFACE_COLORS.map((c) => (
            <Box key={c} padding="3" backgroundColor={c} borderColor="strong" borderWidth="thin" borderRadius="md" color="primary">
              bg={c}
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
              // No Box prop for this — backgroundColor only exposes surface
              // tokens (base/raised/sunken/overlay), never dark action colors.
              // text.inverse's real, only intended pairing is a solid action
              // background (e.g. a primary button) per semantic-color.json's
              // own description ("text on solid dark backgrounds"). Nothing
              // in Box's current surface-only color scope can demonstrate
              // that pairing, so this one swatch reaches past Box's props to
              // prove the token itself round-trips correctly — a real, open
              // question about whether Box should eventually expose action
              // colors too, or whether that's Button's job (Phase 7).
              <Box key={c} padding="3" borderRadius="md" color={c} className="demo-inverse-swatch-bg">
                color={c} (bg: action.primary, not a Box prop — see comment)
              </Box>
            ) : (
              <Box key={c} padding="3" backgroundColor="sunken" borderRadius="md" color={c}>
                color={c}
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
          <Box as="strong" color="primary" padding="0">
            Card title
          </Box>
          <Box color="secondary" padding="0">
            Card body text, using color=secondary for the deemphasized read.
          </Box>
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

function App() {
  const [renderCount, setRenderCount] = useState(0);
  return (
    <ThemeProvider>
      <Box
        padding="4"
        display="flex"
        flexDirection="column"
        gap="4"
        color="primary"
        backgroundColor="base"
        className="demo-max-w-960-centered"
      >
        {/* color="primary" here is deliberate, not decorative: `color` inherits
            by default in CSS, so setting it once on the root Box is what
            makes every nested Box below legible in dark mode without each one
            needing its own `color` prop. Found the hard way — every gallery
            section below was invisible-black-text-on-dark-background in dark
            mode before this line existed. Nothing about Box itself was wrong;
            this project has no page-level base/reset rule yet (real gap,
            flagged separately), so nothing set a default text color at all. */}
        <Box as="h1" padding="1" marginTop={"0"} color="secondary" backgroundColor="raised">
          Box variant gallery
        </Box>
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
