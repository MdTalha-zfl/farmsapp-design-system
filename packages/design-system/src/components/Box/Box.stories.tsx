import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box";

const meta = {
  title: "Components/Box",
  component: Box,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "select", options: ["base", "raised", "sunken", "overlay"] },
    borderColor: { control: "select", options: [undefined, "subtle", "default", "strong"] },
    borderRadius: { control: "select", options: [undefined, "none", "sm", "md", "lg", "xl", "full"] },
    borderWidth: { control: "select", options: [undefined, "thin", "thick", "heavy"] },
    padding: { control: "select", options: ["0", "0-5", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] },
    as: { control: "text" },
  },
  args: {
    padding: "4",
    borderRadius: "md",
    borderWidth: "thin",
    borderColor: "default",
    children: "Box",
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every `backgroundColor` × `borderColor` combination Box accepts — the
 * layering Box exists to make possible (raised card on a sunken page, an
 * overlay above both), not a raw token dump (see the Tokens/Colors page for
 * that). */
export const Surfaces: Story = {
  render: (args) => (
    <Box display="flex" gap="4" flexWrap="wrap">
      {(["base", "raised", "sunken", "overlay"] as const).map((backgroundColor) => (
        <Box
          key={backgroundColor}
          {...args}
          backgroundColor={backgroundColor}
          padding="6"
          borderRadius="md"
          borderWidth="thin"
          borderColor="default"
        >
          {backgroundColor}
        </Box>
      ))}
    </Box>
  ),
  args: { children: undefined },
};
