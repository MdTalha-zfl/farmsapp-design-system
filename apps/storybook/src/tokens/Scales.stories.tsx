import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Stack } from "@farmsapp/design-system";
import { readToken } from "./readToken";

const meta = {
  title: "Tokens/Scales",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SPACE_STEPS = ["0-5", "0", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] as const;
const RADIUS_STEPS = ["none", "sm", "md", "lg", "xl", "full"] as const;
const BORDER_WIDTH_STEPS = ["thin", "thick", "heavy"] as const;
const CONTAINER_STEPS = ["sm", "md", "lg", "xl"] as const;

export const Spacing: Story = {
  render: () => (
    <Stack gap="2">
      {SPACE_STEPS.map((step) => {
        const varName = `--ds-space-${step}`;
        const value = readToken(varName);
        return (
          <Box key={step} display="flex" alignItems="center" gap="3">
            <Box unsafeStyle={{ width: 80, fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
              space.{step}
            </Box>
            <Box backgroundColor="raised" unsafeStyle={{ height: 16, width: `var(${varName})` }} />
            <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", opacity: 0.7 }}>
              {value}
            </Box>
          </Box>
        );
      })}
    </Stack>
  ),
};

export const Radius: Story = {
  render: () => (
    <Box display="flex" gap="6" flexWrap="wrap">
      {RADIUS_STEPS.map((step) => {
        const varName = `--ds-radius-${step}`;
        const value = readToken(varName);
        return (
          <Box key={step} display="flex" flexDirection="column" alignItems="center" gap="1">
            <Box
              backgroundColor="raised"
              borderWidth="thin"
              borderColor="default"
              unsafeStyle={{ width: 72, height: 72, borderRadius: `var(${varName})` }}
            />
            <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>radius.{step}</Box>
            <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.6875rem", opacity: 0.7 }}>
              {value}
            </Box>
          </Box>
        );
      })}
    </Box>
  ),
};

export const BorderWidth: Story = {
  render: () => (
    <Box display="flex" gap="6" flexWrap="wrap">
      {BORDER_WIDTH_STEPS.map((step) => (
        <Box key={step} display="flex" flexDirection="column" alignItems="center" gap="1">
          <Box backgroundColor="raised" borderColor="strong" borderWidth={step} unsafeStyle={{ width: 72, height: 72 }} />
          <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
            border-width.{step} — {readToken(`--ds-border-width-${step}`)}
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

export const ContainerMaxWidth: Story = {
  render: () => (
    <Stack gap="2">
      {CONTAINER_STEPS.map((step) => {
        const varName = `--ds-container-max-width-${step}`;
        const value = readToken(varName);
        return (
          <Box key={step} display="flex" alignItems="center" gap="3">
            <Box unsafeStyle={{ width: 80, fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
              {step}
            </Box>
            <Box
              backgroundColor="raised"
              borderWidth="thin"
              borderColor="default"
              unsafeStyle={{ height: 16, width: `var(${varName})`, maxWidth: "100%" }}
            />
            <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", opacity: 0.7 }}>
              {value}
            </Box>
          </Box>
        );
      })}
    </Stack>
  ),
};
