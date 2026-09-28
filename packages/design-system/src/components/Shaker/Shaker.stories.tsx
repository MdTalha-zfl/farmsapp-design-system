import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shaker } from "./Shaker";
import { Button } from "../Button/Button";
import { Stack } from "../Stack/Stack";
import { Inline } from "../Inline/Inline";

const meta = {
  title: "Components/Shaker",
  component: Shaker,
  tags: ["autodocs"],
} satisfies Meta<typeof Shaker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A slow, smooth, continuous wiggle for as long as `shake` stays
 * `true` — the ambient "look here" cue for an idle CTA. */
export const Continuous: Story = {
  args: { children: null },
  render: () => (
    <Shaker shake>
      <Button variant="primary">Place order</Button>
    </Shaker>
  ),
};

export const Intensities: Story = {
  args: { children: null },
  render: () => (
    <Inline gap="4">
      {(["subtle", "medium", "strong"] as const).map((intensity) => (
        <Stack key={intensity} gap="1">
          <span style={{ fontSize: 12, color: "#666" }}>{intensity}</span>
          <Shaker shake intensity={intensity}>
            <Button>Notify me</Button>
          </Shaker>
        </Stack>
      ))}
    </Inline>
  ),
};
