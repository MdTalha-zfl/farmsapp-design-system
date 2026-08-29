import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack";
import { Box } from "../Box/Box";

const meta = {
  title: "Components/Stack",
  component: Stack,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["0", "0-5", "1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] },
  },
  args: {
    gap: "4",
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      {["One", "Two", "Three"].map((label) => (
        <Box key={label} padding="4" backgroundColor="raised" borderRadius="md" borderWidth="thin" borderColor="default">
          {label}
        </Box>
      ))}
    </Stack>
  ),
};
