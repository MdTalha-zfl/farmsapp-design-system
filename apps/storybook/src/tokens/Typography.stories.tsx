import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Stack } from "@farmsapp/design-system";
import { readToken } from "./readToken";

const meta = {
  title: "Tokens/Typography",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The composite text.* tokens Text/Heading resolve `variant` to — see
 * decisions/decision-text-heading-own-typography-props.md. Each sample is
 * styled with the real `font: var(--ds-text-*)` shorthand, not a
 * reimplementation of it. */
const TEXT_STEPS = ["display", "heading-lg", "heading-md", "heading-sm", "body-md", "body-sm", "caption"] as const;

export const TextStyles: Story = {
  render: () => (
    <Stack gap="4">
      {TEXT_STEPS.map((step) => {
        const varName = `--ds-text-${step}`;
        return (
          <Box key={step} borderColor="subtle" borderWidth="thin" borderRadius="md" padding="3">
            <Box
              unsafeStyle={{ font: `var(${varName})` }}
              paddingBottom="1"
            >
              The quick brown fox jumps over the lazy dog
            </Box>
            <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.6875rem", opacity: 0.7 }}>
              text.{step} → {readToken(varName)}
            </Box>
          </Box>
        );
      })}
    </Stack>
  ),
};

const FONT_SIZE_STEPS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

export const FontSize: Story = {
  render: () => (
    <Stack gap="2">
      {FONT_SIZE_STEPS.map((step) => {
        const varName = `--ds-font-size-${step}`;
        return (
          <Box key={step} display="flex" alignItems="baseline" gap="3">
            <Box unsafeStyle={{ width: 140, fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
              font-size.{step} — {readToken(varName)}
            </Box>
            <Box unsafeStyle={{ fontSize: `var(${varName})` }}>Aa</Box>
          </Box>
        );
      })}
    </Stack>
  ),
};

const FONT_WEIGHT_STEPS = ["regular", "medium", "semibold", "bold"] as const;

export const FontWeight: Story = {
  render: () => (
    <Stack gap="2">
      {FONT_WEIGHT_STEPS.map((step) => {
        const varName = `--ds-font-weight-${step}`;
        return (
          <Box key={step} display="flex" alignItems="baseline" gap="3">
            <Box unsafeStyle={{ width: 140, fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
              font-weight.{step} — {readToken(varName)}
            </Box>
            <Box unsafeStyle={{ fontWeight: `var(${varName})` as unknown as number, fontSize: "1.25rem" }}>
              The quick brown fox
            </Box>
          </Box>
        );
      })}
    </Stack>
  ),
};
