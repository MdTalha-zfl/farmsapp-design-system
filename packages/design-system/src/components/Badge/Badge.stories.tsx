import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, AlertCircleIcon, XIcon } from "@farmsapp/icons";
import { Badge } from "./Badge";
import { Box } from "../Box/Box";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["success", "warning", "danger"],
    },
    emphasis: {
      control: "select",
      options: ["subtle", "intense"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    shape: {
      control: "select",
      options: ["rounded", "square"],
    },
  },
  args: {
    color: "success",
    emphasis: "subtle",
    size: "medium",
    shape: "square",
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const colors = ["success", "warning", "danger"] as const;
const emphases = ["subtle", "intense"] as const;
const sizes = ["small", "medium", "large"] as const;
const shapes = ["rounded", "square"] as const;

export const Default: Story = {};

/** All colors, at both emphasis levels. */
export const Colors: Story = {
  render: () => (
    <Stack gap="4">
      {emphases.map((emphasis) => (
        <Inline key={emphasis} gap="3" alignItems="center">
          {colors.map((color) => (
            <Badge key={color} color={color} emphasis={emphasis}>
              {color}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Both shapes — "rounded" (a pill, matching Blade's own fixed shape) vs
 * "square" (the default, radius.sm) — across all colors. */
export const Shape: Story = {
  render: () => (
    <Stack gap="4">
      {shapes.map((shape) => (
        <Inline key={shape} gap="3" alignItems="center">
          {colors.map((color) => (
            <Badge key={color} color={color} shape={shape}>
              {color}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** All 3 sizes, across all colors. */
export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3" alignItems="center">
          {colors.map((color) => (
            <Badge key={color} color={color} size={size}>
              {size}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Icon + text, across all colors and sizes. Icon always renders at Icon's
 * own "small" size regardless of Badge size — see
 * decisions/decision-badge-size-scale-drops-xsmall.md for why. */
export const WithIcon: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3" alignItems="center">
          <Badge color="success" size={size} icon={CheckIcon}>
            Paid
          </Badge>
          <Badge color="warning" size={size} icon={AlertCircleIcon}>
            Pending
          </Badge>
          <Badge color="danger" size={size} icon={XIcon}>
            Failed
          </Badge>
        </Inline>
      ))}
    </Stack>
  ),
};

/** Subtle (default) vs intense emphasis, side by side. */
export const Emphasis: Story = {
  render: () => (
    <Inline gap="6">
      {emphases.map((emphasis) => (
        <Stack key={emphasis} gap="2">
          <Inline gap="3" alignItems="center">
            {colors.map((color) => (
              <Badge key={color} color={color} emphasis={emphasis}>
                {color}
              </Badge>
            ))}
          </Inline>
        </Stack>
      ))}
    </Inline>
  ),
};

/** Long text truncates to a single line rather than wrapping or overflowing
 * — Badge always constrains itself to one line (`truncateAfterLines={1}`
 * on the underlying Text), demonstrated here inside a fixed-width box. */
export const TextTruncation: Story = {
  render: () => (
    <Box unsafeStyle={{ width: "160px" }}>
      <Badge color="warning" icon={AlertCircleIcon}>
        Awaiting approval from manager
      </Badge>
    </Box>
  ),
};

/** Badge accepts the margin family directly (`margin`, `marginTop/Right/
 * Bottom/Left`, `marginX`/`marginY`) — no wrapper `Box` needed. See
 * decisions/decision-margin-props-shared-across-components.md. */
export const WithMargin: Story = {
  render: () => (
    <Box unsafeStyle={{ border: "1px dashed var(--ds-color-border-default)" }}>
      <Badge color="success" marginTop="6" marginLeft="4">
        Offset via marginTop/marginLeft
      </Badge>
    </Box>
  ),
};

/** On dark, colored surfaces, `emphasis="intense"` reads clearly where
 * `subtle` would lose contrast. */
export const OnColoredSurface: Story = {
  render: () => (
    <Box padding="4" backgroundColor="sunken" borderRadius="md">
      <Inline gap="3" alignItems="center">
        {colors.map((color) => (
          <Badge key={color} color={color} emphasis="intense">
            {color}
          </Badge>
        ))}
      </Inline>
    </Box>
  ),
};
