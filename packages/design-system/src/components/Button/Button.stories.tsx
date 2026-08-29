
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, SearchIcon } from "@farmsapp/icons";
import { Button } from "./Button";
import { Box } from "../Box/Box";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "negative"],
    },
    size: {
      control: "select",
      options: ["xsmall", "small", "medium", "large"],
    },
    iconPosition: {
      control: "select",
      options: ["left", "right"],
    },
    isDisabled: { control: "boolean" },
    isFullWidth: { control: "boolean" },
    isLoading: { control: "boolean" },
  },
  args: {
    variant: "primary",
    size: "medium",
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = ["primary", "secondary", "tertiary", "negative"] as const;
const sizes = ["xsmall", "small", "medium", "large"] as const;

export const Default: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button key={variant} size={size} variant={variant}>
              Button
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** All button variants across all available sizes. */
export const Variants: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button key={variant} size={size} variant={variant}>
              {variant}
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** All button sizes across all available variants. */
export const Sizes: Story = {
  render: () => (
    <Stack gap="4" alignItems="start">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button key={variant} size={size} variant={variant}>
              Buy Now
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Icon + text across all sizes and variants. */
export const WithIcon: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button
              key={`${variant}-left`}
              size={size}
              variant={variant}
              icon={SearchIcon}
              iconPosition="left"
            >
              Search
            </Button>
          ))}

          {variants.map((variant) => (
            <Button
              key={`${variant}-right`}
              size={size}
              variant={variant}
              icon={CheckIcon}
              iconPosition="right"
            >
              Confirm
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Icon-only buttons across all sizes and variants. */
export const IconOnly: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button
              key={variant}
              size={size}
              variant={variant}
              icon={CheckIcon}
              accessibilityLabel="Confirm"
            />
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Loading buttons across all sizes and variants. */
export const Loading: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button
              key={variant}
              size={size}
              variant={variant}
              isLoading
            >
              Loading
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Disabled buttons across all sizes and variants. */
export const Disabled: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button
              key={variant}
              size={size}
              variant={variant}
              isDisabled
            >
              Disabled
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

/** Full-width buttons across all sizes and variants. */
export const FullWidth: Story = {
  render: () => (
    <Box
      unsafeStyle={{ width: "100%" }}
      padding="3"
      backgroundColor="sunken"
      borderRadius="md"
    >
      <Stack gap="3">
        {sizes.map((size) => (
          <Stack key={size} gap="2">
            {variants.map((variant) => (
              <Button
                key={variant}
                size={size}
                variant={variant}
                isFullWidth
              >
                Button
              </Button>
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  ),
};

/** Link buttons across all sizes and variants. */
export const AsLink: Story = {
  render: () => (
    <Stack gap="4">
      {sizes.map((size) => (
        <Inline key={size} gap="3">
          {variants.map((variant) => (
            <Button
              key={variant}
              href="#"
              size={size}
              variant={variant}
            >
              Go somewhere
            </Button>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};
