import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Stack } from "@farmsapp/design-system";
import { ColorScale, SemanticSwatch } from "./ColorScale";

/**
 * Every swatch reads its value live from the cascade (see readToken.ts) —
 * switch the Theme/Brand toolbar above and these update for real, the same
 * way a consuming app's UI does. Nothing here is a flattened TS constant.
 */
const meta = {
  title: "Tokens/Colors",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primitive: Story = {
  render: () => (
    <Stack gap="6">
      <ColorScale label="Brand" prefix="--ds-color-brand" />
      <ColorScale label="Neutral" prefix="--ds-color-neutral" />
      <ColorScale label="Danger" prefix="--ds-color-danger" />
      <ColorScale label="Warning" prefix="--ds-color-warning" />
      <ColorScale label="Success" prefix="--ds-color-success" />
    </Stack>
  ),
};

export const Semantic: Story = {
  render: () => (
    <Stack gap="6">
      <Box>
        <Box paddingBottom="2" unsafeStyle={{ fontWeight: 600 }}>
          Surface
        </Box>
        <Stack gap="2">
          <SemanticSwatch label="surface.base" varName="--ds-color-surface-base" />
          <SemanticSwatch label="surface.raised" varName="--ds-color-surface-raised" />
          <SemanticSwatch label="surface.sunken" varName="--ds-color-surface-sunken" />
          <SemanticSwatch label="surface.overlay" varName="--ds-color-surface-overlay" />
        </Stack>
      </Box>
      <Box>
        <Box paddingBottom="2" unsafeStyle={{ fontWeight: 600 }}>
          Border
        </Box>
        <Stack gap="2">
          <SemanticSwatch label="border.subtle" varName="--ds-color-border-subtle" />
          <SemanticSwatch label="border.default" varName="--ds-color-border-default" />
          <SemanticSwatch label="border.strong" varName="--ds-color-border-strong" />
        </Stack>
      </Box>
      <Box>
        <Box paddingBottom="2" unsafeStyle={{ fontWeight: 600 }}>
          Text
        </Box>
        <Stack gap="2">
          <SemanticSwatch label="text.primary" varName="--ds-color-text-primary" />
          <SemanticSwatch label="text.secondary" varName="--ds-color-text-secondary" />
          <SemanticSwatch label="text.disabled" varName="--ds-color-text-disabled" />
          <SemanticSwatch label="text.inverse" varName="--ds-color-text-inverse" />
          <SemanticSwatch label="text.danger" varName="--ds-color-text-danger" />
          <SemanticSwatch label="text.warning" varName="--ds-color-text-warning" />
          <SemanticSwatch label="text.success" varName="--ds-color-text-success" />
        </Stack>
      </Box>
      <Box>
        <Box paddingBottom="2" unsafeStyle={{ fontWeight: 600 }}>
          Action
        </Box>
        <Stack gap="2">
          <SemanticSwatch label="action.primary" varName="--ds-color-action-primary" />
          <SemanticSwatch label="action.primary-hover" varName="--ds-color-action-primary-hover" />
          <SemanticSwatch label="action.primary-active" varName="--ds-color-action-primary-active" />
          <SemanticSwatch label="action.primary-disabled" varName="--ds-color-action-primary-disabled" />
        </Stack>
      </Box>
      <Box>
        <Box paddingBottom="2" unsafeStyle={{ fontWeight: 600 }}>
          Feedback
        </Box>
        <Stack gap="2">
          <SemanticSwatch label="feedback.success" varName="--ds-color-feedback-success" />
          <SemanticSwatch label="feedback.warning" varName="--ds-color-feedback-warning" />
          <SemanticSwatch label="feedback.danger" varName="--ds-color-feedback-danger" />
          <SemanticSwatch label="feedback.success-subtle" varName="--ds-color-feedback-success-subtle" />
          <SemanticSwatch label="feedback.warning-subtle" varName="--ds-color-feedback-warning-subtle" />
          <SemanticSwatch label="feedback.danger-subtle" varName="--ds-color-feedback-danger-subtle" />
        </Stack>
      </Box>
      <Box>
        <Box paddingBottom="2" unsafeStyle={{ fontWeight: 600 }}>
          Focus
        </Box>
        <Stack gap="2">
          <SemanticSwatch label="focus.ring" varName="--ds-color-focus-ring" />
        </Stack>
      </Box>
    </Stack>
  ),
};
