import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CartQuantityStepper } from "./CartQuantityStepper";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/CartQuantityStepper",
  component: CartQuantityStepper,
  tags: ["autodocs"],
} satisfies Meta<typeof CartQuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Product listing / product detail: the `-` button stays a `-` down to
 * `min` (1), where it disables — same as any other stepper. */
export const ProductPage: Story = {
  render: (args) => {
    const [value, setValue] = useState(1);
    return <CartQuantityStepper {...args} value={value} onChange={setValue} />;
  },
};

/** Cart line: `showTrashIcon` turns the `-` button into a trash button once
 * quantity reaches `min` (1), since going lower means removing the line, not
 * stepping down further. `onRemove` fires instead of a decrement. */
export const CartLineWithRemove: Story = {
  render: (args) => {
    const [value, setValue] = useState(1);
    const [removed, setRemoved] = useState(false);
    if (removed) {
      return <Text variant="body">Removed from cart.</Text>;
    }
    return (
      <Stack gap="2">
        <CartQuantityStepper
          {...args}
          value={value}
          onChange={setValue}
          showTrashIcon
          onRemove={() => setRemoved(true)}
        />
        <Text variant="caption" size="small">
          quantity: {value}
        </Text>
      </Stack>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      <CartQuantityStepper size="small" defaultValue={1} />
      <CartQuantityStepper size="medium" defaultValue={1} />
      <CartQuantityStepper size="large" defaultValue={1} />
    </Stack>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: 2, isDisabled: true },
};
