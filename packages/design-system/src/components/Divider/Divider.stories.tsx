import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";
import { Box } from "../Box/Box";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    dividerStyle: {
      control: "select",
      options: ["solid", "dashed"],
    },
    variant: {
      control: "select",
      options: ["normal", "subtle", "muted"],
    },
    thickness: {
      control: "select",
      options: ["thinner", "thin", "thick", "thicker"],
    },
  },
  args: {
    orientation: "horizontal",
    dividerStyle: "solid",
    variant: "normal",
    thickness: "thin",
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

const dividerStyles = ["solid", "dashed"] as const;
const variants = ["normal", "subtle", "muted"] as const;
const thicknesses = ["thinner", "thin", "thick", "thicker"] as const;

export const Default: Story = {};

/** Horizontal (default, full-width) vs vertical — vertical needs an explicit
 * height since it has no line-box content of its own to size against. */
export const Orientation: Story = {
  render: () => (
    <Stack gap="6">
      <Box unsafeStyle={{ width: "240px" }}>
        <Divider orientation="horizontal" />
      </Box>
      <Inline gap="4" alignItems="center">
        <Text variant="body" size="medium">
          Left
        </Text>
        <Divider orientation="vertical" height="24px" />
        <Text variant="body" size="medium">
          Right
        </Text>
      </Inline>
    </Stack>
  ),
};

/** Solid vs dashed, across all variants. */
export const Style: Story = {
  render: () => (
    <Stack gap="4">
      {dividerStyles.map((dividerStyle) => (
        <Box key={dividerStyle} unsafeStyle={{ width: "240px" }}>
          <Text variant="caption" size="small" marginBottom="1">
            {dividerStyle}
          </Text>
          <Divider dividerStyle={dividerStyle} />
        </Box>
      ))}
    </Stack>
  ),
};

/** All three border-color variants — "muted" is "subtle" at reduced opacity
 * (see Divider.tsx's own note on why there's no dedicated 4th border-color
 * token), so it reads faintest of the three. */
export const Variant: Story = {
  render: () => (
    <Stack gap="4">
      {variants.map((variant) => (
        <Box key={variant} unsafeStyle={{ width: "240px" }}>
          <Text variant="caption" size="small" marginBottom="1">
            {variant}
          </Text>
          <Divider variant={variant} />
        </Box>
      ))}
    </Stack>
  ),
};

/** All 4 thickness steps. "thinner" and "thin" render identically — the
 * token scale only has thin/thick/heavy border widths, so there's no
 * distinct 4th width to give "thinner" without inventing a new token. */
export const Thickness: Story = {
  render: () => (
    <Stack gap="4">
      {thicknesses.map((thickness) => (
        <Box key={thickness} unsafeStyle={{ width: "240px" }}>
          <Text variant="caption" size="small" marginBottom="1">
            {thickness}
          </Text>
          <Divider thickness={thickness} />
        </Box>
      ))}
    </Stack>
  ),
};

/** Typical usage: separating stacked content sections. */
export const BetweenContent: Story = {
  render: () => (
    <Box unsafeStyle={{ width: "280px" }}>
      <Stack gap="3">
        <Text variant="body" size="medium">
          Section one
        </Text>
        <Divider />
        <Text variant="body" size="medium">
          Section two
        </Text>
        <Divider />
        <Text variant="body" size="medium">
          Section three
        </Text>
      </Stack>
    </Box>
  ),
};

/** Vertical dividers separating inline items — e.g. a breadcrumb-style or
 * toolbar layout. */
export const VerticalBetweenItems: Story = {
  render: () => (
    <Inline gap="4" alignItems="center">
      <Text variant="body" size="medium">
        Home
      </Text>
      <Divider orientation="vertical" height="16px" />
      <Text variant="body" size="medium">
        Settings
      </Text>
      <Divider orientation="vertical" height="16px" />
      <Text variant="body" size="medium">
        Profile
      </Text>
    </Inline>
  ),
};

/** Divider accepts the margin family directly (`margin`, `marginTop/Right/
 * Bottom/Left`, `marginX`/`marginY`) — no wrapper `Box` needed. See
 * decisions/decision-margin-props-shared-across-components.md. */
export const WithMargin: Story = {
  render: () => (
    <Box unsafeStyle={{ width: "240px", border: "1px dashed var(--ds-color-border-default)" }}>
      <Text variant="body" size="medium">
        Above
      </Text>
      <Divider marginTop="4" marginBottom="4" />
      <Text variant="body" size="medium">
        Below
      </Text>
    </Box>
  ),
};
