import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";
import { Inline } from "../Inline/Inline";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Wraps @farmsapp/icons' LoaderCircleIcon (decorative, aria-hidden). The real accessible name comes from Spinner's own `role=\"status\"` + required `accessibilityLabel`, not the icon.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
  },
  args: {
    size: "medium",
    accessibilityLabel: "Loading",
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <Inline gap="4" alignItems="center">
      {(["small", "medium", "large"] as const).map((size) => (
        <Spinner key={size} size={size} accessibilityLabel="Loading" />
      ))}
    </Inline>
  ),
};

/** Spinner accepts the margin family directly — no wrapper `Box` needed.
 * See decisions/decision-margin-props-shared-across-components.md. */
export const WithMargin: Story = {
  render: () => <Spinner accessibilityLabel="Loading" marginLeft="6" />,
};
