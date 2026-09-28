import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pulser } from "./Pulser";
import { Button } from "../Button/Button";
import { Stack } from "../Stack/Stack";
import { Inline } from "../Inline/Inline";

const meta = {
  title: "Components/Pulser",
  component: Pulser,
  tags: ["autodocs"],
} satisfies Meta<typeof Pulser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A double zoom-in/zoom-out pulse with a hold between cycles, for as
 * long as `pulse` stays `true` — the ambient "look here" cue for an
 * idle CTA. */
export const Continuous: Story = {
  args: { children: null },
  render: () => (
    <Pulser pulse>
      <Button variant="primary">Place order</Button>
    </Pulser>
  ),
};

export const Intensities: Story = {
  args: { children: null },
  render: () => (
    <Inline gap="4">
      {(["subtle", "medium", "strong"] as const).map((intensity) => (
        <Stack key={intensity} gap="1">
          <span style={{ fontSize: 12, color: "#666" }}>{intensity}</span>
          <Pulser pulse intensity={intensity}>
            <Button>Notify me</Button>
          </Pulser>
        </Stack>
      ))}
    </Inline>
  ),
};
