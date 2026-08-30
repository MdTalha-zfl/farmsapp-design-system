import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchInput } from "./SearchInput";
import { Stack } from "../../Stack/Stack";

const meta = {
  title: "Components/Input/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["xsmall", "small", "medium", "large"] },
  },
  args: {
    id: "search-input-default",
    placeholder: "Search...",
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** SearchInput has no validation/necessity props at all — it never renders
 * a FormHint, matching the spec's "search fields aren't validated form
 * fields" rule. */
export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      {(["xsmall", "small", "medium", "large"] as const).map((size) => (
        <SearchInput key={size} id={`search-input-size-${size}`} placeholder="Search..." size={size} />
      ))}
    </Stack>
  ),
};

function ClearableExample() {
  const [value, setValue] = useState("design tokens");
  return (
    <SearchInput
      id="search-input-clearable"
      value={value}
      onChange={(e) => setValue(e.value)}
      showClearButton
      onClearButtonClick={() => setValue("")}
    />
  );
}

export const Clearable: Story = {
  render: () => <ClearableExample />,
};

export const Loading: Story = {
  args: {
    id: "search-input-loading",
    defaultValue: "design tokens",
    isLoading: true,
  },
};

export const WithoutSearchIcon: Story = {
  args: {
    id: "search-input-no-icon",
    showSearchIcon: false,
  },
};

export const Disabled: Story = {
  args: {
    id: "search-input-disabled",
    defaultValue: "design tokens",
    isDisabled: true,
  },
};
