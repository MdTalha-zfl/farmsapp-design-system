import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inline } from "./Inline";
import { Box } from "../Box/Box";

const meta = {
  title: "Components/Inline",
  component: Inline,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["0", "0-5", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] },
    wrap: { control: "boolean" },
  },
  args: {
    gap: "2",
    wrap: true,
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Inline {...args}>
      {["One", "Two", "Three", "Four", "Five", "Six"].map((label) => (
        <Box key={label} padding="3" backgroundColor="raised" borderRadius="md" borderWidth="thin" borderColor="default">
          {label}
        </Box>
      ))}
    </Inline>
  ),
};
