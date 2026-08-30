import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "@farmsapp/icons";
import { TextInput } from "./TextInput";
import { Box } from "../../Box/Box";
import { Stack } from "../../Stack/Stack";

const meta = {
  title: "Components/Input/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["xsmall", "small", "medium", "large"] },
    validationState: { control: "select", options: ["none", "error", "success"] },
    necessityIndicator: { control: "select", options: ["required", "optional", "none"] },
    labelPosition: { control: "select", options: ["top", "left"] },
  },
  args: {
    id: "text-input-default",
    label: "Full name",
    placeholder: "Jane Doe",
    size: "medium",
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** All 4 sizes. */
export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      {(["xsmall", "small", "medium", "large"] as const).map((size) => (
        <TextInput key={size} id={`text-input-size-${size}`} label={`Size: ${size}`} placeholder="Jane Doe" size={size} />
      ))}
    </Stack>
  ),
};

/** The three validation states — "error" and "success" recolor the border
 * and render an icon + message via FormHint; `aria-invalid` is set
 * automatically for "error". */
export const ValidationStates: Story = {
  render: () => (
    <Stack gap="4">
      <TextInput id="text-input-help" label="Email" defaultValue="jane@example" helpText="We'll never share your email." />
      <TextInput
        id="text-input-error"
        label="Email"
        defaultValue="jane@example"
        validationState="error"
        errorText="Enter a valid email address."
      />
      <TextInput
        id="text-input-success"
        label="Email"
        defaultValue="jane@example.com"
        validationState="success"
        successText="Looks good!"
      />
    </Stack>
  ),
};

/** `necessityIndicator` — "required" renders a red asterisk, "optional"
 * renders a trailing "(optional)" caption. */
export const NecessityIndicator: Story = {
  render: () => (
    <Stack gap="4">
      <TextInput id="text-input-required" label="Full name" necessityIndicator="required" isRequired />
      <TextInput id="text-input-optional" label="Middle name" necessityIndicator="optional" />
    </Stack>
  ),
};

/** `labelPosition="left"` — falls back to stacked "top" positioning below
 * the 768px breakpoint (see formLabel.css). */
export const LabelPosition: Story = {
  render: () => (
    <Box unsafeStyle={{ width: "420px" }}>
      <TextInput id="text-input-label-left" label="Full name" labelPosition="left" placeholder="Jane Doe" />
    </Box>
  ),
};

/** Leading/trailing icon slots. */
export const WithIcons: Story = {
  render: () => (
    <Stack gap="4">
      <TextInput id="text-input-leading-icon" label="Search" leading={SearchIcon} placeholder="Search..." />
      <TextInput id="text-input-prefix" label="Price" prefix="$" placeholder="0.00" />
      <TextInput id="text-input-suffix" label="Weight" suffix="kg" placeholder="0" />
    </Stack>
  ),
};

/** A live-controlled example: typing updates `value`, and the clear button
 * (shown once there's a value) resets it. */
function ClearableExample() {
  const [value, setValue] = useState("Jane Doe");
  return (
    <TextInput
      id="text-input-clearable"
      label="Full name"
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
  render: () => <TextInput id="text-input-loading" label="Checking availability" defaultValue="jane-doe" isLoading />,
};

/** `maxCharacters` drives a CharacterCounter footer slot automatically. */
function CharacterLimitExample() {
  const [value, setValue] = useState("Hello");
  return (
    <TextInput id="text-input-max-chars" label="Nickname" value={value} onChange={(e) => setValue(e.value)} maxCharacters={20} />
  );
}

export const CharacterLimit: Story = {
  render: () => <CharacterLimitExample />,
};

export const Disabled: Story = {
  args: {
    id: "text-input-disabled",
    label: "Full name",
    defaultValue: "Jane Doe",
    isDisabled: true,
  },
};
