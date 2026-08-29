import type { Meta, StoryObj } from "@storybook/react-vite";
import { XIcon } from "@farmsapp/icons";
import { IconButton } from "./IconButton";
import { Inline } from "../Inline/Inline";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
    emphasis: { control: "select", options: ["subtle", "intense", "moderate"] },
    isHighlighted: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: {
    icon: XIcon,
    accessibilityLabel: "Close",
    size: "medium",
    emphasis: "intense",
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `emphasis` — subtle/intense/moderate. Only "moderate" gets a background
 * container by default; subtle/intense stay fully transparent unless
 * `isHighlighted` is also set (see IconButton.tsx's `wantsContainer`). */
export const Emphasis: Story = {
  render: () => (
    <Inline gap="3">
      <IconButton icon={XIcon} accessibilityLabel="Close" emphasis="subtle" />
      <IconButton icon={XIcon} accessibilityLabel="Close" emphasis="intense" />
      <IconButton icon={XIcon} accessibilityLabel="Close" emphasis="moderate" />
    </Inline>
  ),
};

/** `size` — small/medium/large, mapping 1:1 to the rendered Icon's own size
 * (no text label competing for space here, unlike Button). */
export const Sizes: Story = {
  render: () => (
    <Inline gap="3" alignItems="center">
      {(["small", "medium", "large"] as const).map((size) => (
        <IconButton key={size} icon={XIcon} accessibilityLabel="Close" size={size} />
      ))}
    </Inline>
  ),
};

/** `isHighlighted` — forces the background container on for subtle/intense
 * too (small/medium sizes only — see IconButton.tsx's `CONTAINER_ELIGIBLE_SIZES`). */
export const Highlighted: Story = {
  render: () => (
    <Inline gap="3">
      <IconButton icon={XIcon} accessibilityLabel="Close" emphasis="subtle" isHighlighted={false} />
      <IconButton icon={XIcon} accessibilityLabel="Close" emphasis="subtle" isHighlighted={true} />
    </Inline>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
};
