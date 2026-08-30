import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextArea } from "./TextArea";
import { Stack } from "../../Stack/Stack";

const meta = {
  title: "Components/Input/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["xsmall", "small", "medium", "large"] },
    validationState: { control: "select", options: ["none", "error", "success"] },
  },
  args: {
    id: "textarea-default",
    label: "Bio",
    placeholder: "Tell us about yourself...",
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `numberOfLines` sets the initial visible row count. */
export const NumberOfLines: Story = {
  render: () => (
    <Stack gap="4">
      <TextArea id="textarea-2-lines" label="Short bio" numberOfLines={2} placeholder="Two rows tall" />
      <TextArea id="textarea-5-lines" label="Long bio" numberOfLines={5} placeholder="Five rows tall" />
    </Stack>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <Stack gap="4">
      <TextArea id="textarea-help" label="Comments" helpText="Optional — share anything else we should know." />
      <TextArea id="textarea-error" label="Comments" defaultValue="" validationState="error" errorText="Comments can't be empty." />
      <TextArea id="textarea-success" label="Comments" defaultValue="All good here." validationState="success" successText="Saved." />
    </Stack>
  ),
};

/** `maxCharacters` drives a CharacterCounter footer slot, same as
 * TextInput/PasswordInput. */
function CharacterLimitExample() {
  const [value, setValue] = useState("This bio is going pretty well so far.");
  return (
    <TextArea id="textarea-max-chars" label="Bio" value={value} onChange={(e) => setValue(e.value)} maxCharacters={160} numberOfLines={3} />
  );
}

export const CharacterLimit: Story = {
  render: () => <CharacterLimitExample />,
};

/** The clear button sits above the field (BaseInput's `trailingHeaderSlot`)
 * rather than inline with the text, since a multi-line field has no single
 * "end" to anchor an inline adornment to. */
function ClearableExample() {
  const [value, setValue] = useState("Some notes to clear.");
  return (
    <TextArea
      id="textarea-clearable"
      label="Notes"
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

export const Disabled: Story = {
  args: {
    id: "textarea-disabled",
    label: "Bio",
    defaultValue: "This field is disabled.",
    isDisabled: true,
  },
};
