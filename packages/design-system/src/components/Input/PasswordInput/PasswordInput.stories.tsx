import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordInput } from "./PasswordInput";
import { Stack } from "../../Stack/Stack";

const meta = {
  title: "Components/Input/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["xsmall", "small", "medium", "large"] },
    validationState: { control: "select", options: ["none", "error", "success"] },
  },
  args: {
    id: "password-input-default",
    label: "Password",
    placeholder: "Enter your password",
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The reveal toggle flips the native `type` between "password" and
 * "text" — it never renders the raw value through anything other than the
 * real input type, so browser password managers keep working correctly. */
function RevealExample() {
  const [value, setValue] = useState("hunter2");
  return <PasswordInput id="password-input-reveal" label="Password" value={value} onChange={(e) => setValue(e.value)} />;
}

export const RevealToggle: Story = {
  render: () => <RevealExample />,
};

/** `showRevealButton={false}` hides the toggle entirely — the reveal
 * button is also always hidden when `isDisabled`. */
export const WithoutRevealButton: Story = {
  args: {
    id: "password-input-no-reveal",
    label: "Password",
    defaultValue: "hunter2",
    showRevealButton: false,
  },
};

export const ValidationStates: Story = {
  render: () => (
    <Stack gap="4">
      <PasswordInput id="password-input-help" label="New password" helpText="Must be at least 8 characters." />
      <PasswordInput
        id="password-input-error"
        label="New password"
        defaultValue="abc"
        validationState="error"
        errorText="Password must be at least 8 characters."
      />
      <PasswordInput
        id="password-input-success"
        label="New password"
        defaultValue="a-strong-password-123"
        validationState="success"
        successText="Strong password."
      />
    </Stack>
  ),
};

/** `maxCharacters` drives a CharacterCounter footer slot, same as
 * TextInput. */
export const CharacterLimit: Story = {
  args: {
    id: "password-input-max-chars",
    label: "PIN",
    defaultValue: "1234",
    maxCharacters: 6,
  },
};

/** Reveal button is hidden entirely when disabled. */
export const Disabled: Story = {
  args: {
    id: "password-input-disabled",
    label: "Password",
    defaultValue: "hunter2",
    isDisabled: true,
  },
};
