import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shimmer } from "./Shimmer";
import { Button } from "../Button/Button";
import { Stack } from "../Stack/Stack";
import { Inline } from "../Inline/Inline";

const meta = {
  title: "Components/Shimmer",
  component: Shimmer,
  tags: ["autodocs"],
} satisfies Meta<typeof Shimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A diagonal band of light sweeps across the button on a loop, with a
 * hold between passes — the "look here" sheen for an idle "Add to
 * cart" / "Place order" CTA. */
export const Continuous: Story = {
  args: { children: null },
  render: () => (
    <Shimmer shimmer>
      <Button variant="primary">Place order</Button>
    </Shimmer>
  ),
};

export const Speeds: Story = {
  args: { children: null },
  render: () => (
    <Inline gap="4">
      {(["slow", "medium", "fast"] as const).map((speed) => (
        <Stack key={speed} gap="1">
          <span style={{ fontSize: 12, color: "#666" }}>{speed}</span>
          <Shimmer shimmer speed={speed}>
            <Button>Notify me</Button>
          </Shimmer>
        </Stack>
      ))}
    </Inline>
  ),
};
