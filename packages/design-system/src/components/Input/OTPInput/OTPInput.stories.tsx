import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OTPInput } from "./OTPInput";
import { Button } from "../../Button/Button";
import { Stack } from "../../Stack/Stack";
import { Text } from "../../Text/Text";

const meta = {
  title: "Components/Input/OTPInput",
  component: OTPInput,
  tags: ["autodocs"],
  args: { label: "Verification code" },
} satisfies Meta<typeof OTPInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One box per character. Typing fills the box and moves on; Backspace clears
 * the box (or steps back from an empty one); Left/Right/Home/End move between
 * boxes; pasting a code, or an SMS autofill, fills from the box it landed in.
 * Only one box is a Tab stop — the first empty one — so Tab passes through the
 * group in one press. */
export const Default: Story = {
  args: { helpText: "Enter the 6-digit code we sent you" },
};

export const FourAndEightDigits: Story = {
  render: () => (
    <Stack gap="4">
      <OTPInput label="4 digits" otpLength={4} />
      <OTPInput label="8 digits" otpLength={8} />
    </Stack>
  ),
};

/** Digits only by default: anything else is dropped as it is typed or pasted (a
 * full-width "１２３" is normalised to digits). `characters="alphanumeric"`
 * accepts letters too. (Blade accepts any character.) */
export const Alphanumeric: Story = {
  args: { label: "Recovery code", characters: "alphanumeric", otpLength: 8 },
};

/** Masked boxes show a bullet as soon as a character is entered. */
export const Masked: Story = {
  args: { label: "PIN", otpLength: 4, isMasked: true },
};

/** `onOTPFilled` fires when a change completes the code — once per such change,
 * not on mount and not on every render (Blade's effect can re-fire on each
 * render while the code is full). */
export const OnFilled: Story = {
  render: () => {
    function Example() {
      const [filled, setFilled] = useState<string[]>([]);
      return (
        <Stack gap="2">
          <OTPInput label="Code" onOTPFilled={({ value }) => setFilled((list) => [...list, value])} />
          <Text variant="body">{`onOTPFilled calls: ${filled.length} (${filled.join(", ") || "none yet"})`}</Text>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Controlled. `value` is the whole code with no gaps, so deleting a middle
 * character closes up the rest, as in a text field. An external reset to `""`
 * empties the boxes (in Blade it can leave stale digits). */
export const Controlled: Story = {
  render: () => {
    function Example() {
      const [code, setCode] = useState("12");
      return (
        <Stack gap="2">
          <OTPInput label="Code" value={code} onChange={({ value }) => setCode(value)} />
          <Text variant="body">{`Value: "${code}"`}</Text>
          <Button size="small" variant="tertiary" onClick={() => setCode("")}>
            Reset
          </Button>
        </Stack>
      );
    }
    return <Example />;
  },
};

export const Validation: Story = {
  render: () => (
    <Stack gap="4">
      <OTPInput label="Help text" helpText="It expires in 10 minutes" />
      <OTPInput label="Error" validationState="error" errorText="That code is not right" defaultValue="123456" />
      <OTPInput label="Success" validationState="success" successText="Verified" defaultValue="123456" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      {(["xsmall", "small", "medium", "large"] as const).map((size) => (
        <OTPInput key={size} label={size} size={size} defaultValue="123" />
      ))}
    </Stack>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <Stack gap="4">
      <OTPInput label="Disabled" isDisabled defaultValue="1234" />
      <OTPInput label="Read only" isReadOnly defaultValue="123456" />
    </Stack>
  ),
};

/** Placeholder is one character per box. */
export const Placeholder: Story = {
  args: { label: "Code", placeholder: "······" },
};

/** With a `name`, one hidden input carries the whole code, so the form submits
 * it once (Blade names every box and the hidden input, so it goes out once per
 * box). The boxes themselves have no name. */
export const InAForm: Story = {
  render: () => {
    function Example() {
      const [submitted, setSubmitted] = useState("(not submitted)");
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll("otp")));
          }}
        >
          <Stack gap="2">
            <OTPInput label="Code" name="otp" />
            <Button type="submit">Verify</Button>
            <Text variant="body">{`getAll("otp"): ${submitted}`}</Text>
          </Stack>
        </form>
      );
    }
    return <Example />;
  },
};

export const LabelOnTheLeft: Story = {
  args: { labelPosition: "left", otpLength: 4 },
};
