import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
  argTypes: {
    level: { control: "select", options: ["1", "2", "3", "4", "5", "6"] },
    variant: { control: "select", options: ["display", "heading-lg", "heading-md", "heading-sm"] },
    weight: { control: "select", options: [undefined, "regular", "medium", "semibold"] },
    color: {
      control: "select",
      options: [undefined, "primary", "secondary", "disabled", "inverse", "danger", "warning", "success"],
    },
    letterSpacing: { control: "select", options: ["tight", "normal", "wide"] },
    lang: { control: "select", options: [undefined, "en", "hi"] },
  },
  args: {
    level: "2",
    variant: "heading-lg",
    children: "The quick brown fox",
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `level` (the rendered tag, h1-h6) and `variant` (the visual size) are
 * independent — see decisions/decision-heading-level-variant-decoupled.md.
 * This story holds level constant to isolate variant's effect. */
export const Variants: Story = {
  render: () => (
    <Stack gap="3">
      {(["display", "heading-lg", "heading-md", "heading-sm"] as const).map((variant) => (
        <Heading key={variant} level="2" variant={variant}>
          {`${variant} — The quick brown fox`}
        </Heading>
      ))}
    </Stack>
  ),
};
