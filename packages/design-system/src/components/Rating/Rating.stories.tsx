import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rating } from "./Rating";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/Rating",
  component: Rating,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "inline-radio", options: ["primary", "warning", "success", "danger"] },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Product card / review summary: a fractional average, read-only. */
export const Default: Story = {
  args: { value: 4.3 },
};

export const WholeAndHalfValues: Story = {
  args: { value: 4.3 },
  render: () => (
    <Stack gap="2">
      <Rating value={0} />
      <Rating value={2.5} />
      <Rating value={3} />
      <Rating value={4.3} />
      <Rating value={5} />
    </Stack>
  ),
};

export const Sizes: Story = {
  args: { value: 4.3 },
  render: () => (
    <Stack gap="2">
      <Rating value={4.3} size="xsmall" />
      <Rating value={4.3} size="small" />
      <Rating value={4.3} size="medium" />
      <Rating value={4.3} size="large" />
    </Stack>
  ),
};

/** `color` defaults to "primary" (brand green, not the conventional
 * gold/amber star-rating hue) — pass "warning" for that familiar gold
 * look, or "success"/"danger" to match a feedback state elsewhere on the
 * same screen. */
export const Colors: Story = {
  args: { value: 4.3 },
  render: () => (
    <Stack gap="2">
      <Rating value={4.3} color="primary" />
      <Rating value={4.3} color="warning" />
      <Rating value={4.3} color="success" />
      <Rating value={4.3} color="danger" />
    </Stack>
  ),
};

/** Folding a review count into the accessible name instead of the default
 * "Rated X out of Y". */
export const WithReviewCount: Story = {
  args: { value: 4.3 },
  render: () => (
    <Stack gap="1">
      <Rating value={4.3} accessibilityLabel="4.3 out of 5, 128 reviews" />
      <Text variant="caption" size="small">
        4.3 (128 reviews)
      </Text>
    </Stack>
  ),
};
