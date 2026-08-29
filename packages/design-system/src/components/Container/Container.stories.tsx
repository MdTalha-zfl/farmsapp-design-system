import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";
import { Box } from "../Box/Box";

const meta = {
  title: "Components/Container",
  component: Container,
  tags: ["autodocs"],
  argTypes: {
    maxWidth: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
  },
  args: {
    maxWidth: "md",
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Box backgroundColor="sunken" padding="4">
      <Container {...args}>
        <Box padding="4" backgroundColor="raised" borderRadius="md" borderWidth="thin" borderColor="default">
          Content clipped to maxWidth="{args.maxWidth}", centered via margin-x: auto.
        </Box>
      </Container>
    </Box>
  ),
};
