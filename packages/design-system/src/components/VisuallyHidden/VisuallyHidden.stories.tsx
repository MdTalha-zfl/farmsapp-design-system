import type { Meta, StoryObj } from "@storybook/react-vite";
import { VisuallyHidden } from "./VisuallyHidden";
import { Box } from "../Box/Box";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/VisuallyHidden",
  component: VisuallyHidden,
  tags: ["autodocs"],
  parameters: {
    // The whole point of this component is that it has no visible render —
    // a11y tooling (or a screen reader) is what actually verifies it,
    // not the canvas.
    docs: { description: { component: "Renders content into the DOM and the accessibility tree, never visually. Inspect via the Accessibility panel, not the canvas." } },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Announced to screen readers only",
  },
  render: (args) => (
    <Box borderWidth="thin" borderColor="default" borderRadius="md" padding="4">
      <Text variant="body">Visible text. </Text>
      <VisuallyHidden {...args} />
    </Box>
  ),
};
