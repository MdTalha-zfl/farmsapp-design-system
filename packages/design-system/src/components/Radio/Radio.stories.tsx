import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup/RadioGroup";
import { Text } from "../Text/Text";
import { Box } from "../Box/Box";

/**
 * Radio is always group-controlled — it throws if rendered outside a
 * RadioGroup (see decisions/decision-radio-group-mandatory-throws.md), so
 * `meta.args`/every story renders a real RadioGroup wrapper, unlike
 * Checkbox's stories which could render Checkbox bare.
 */
const meta = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
  },
  args: {
    value: "option-a",
    children: "Option A",
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default: real native `<input type="radio" name="...">` grouping — no
 * custom keyboard code anywhere, arrow keys between radios in the same
 * group are entirely native browser behavior. See
 * decisions/decision-radio-no-keyboard-code.md. */
export const Default: Story = {
  render: () => (
    <RadioGroup label="Demo group" defaultValue="option-a">
      <Radio value="option-a">Option A</Radio>
      <Radio value="option-b">Option B</Radio>
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <RadioGroup label="Size demo" orientation="horizontal" defaultValue="medium">
      <Radio value="small" size="small">
        Small
      </Radio>
      <Radio value="medium" size="medium">
        Medium
      </Radio>
      <Radio value="large" size="large">
        Large
      </Radio>
    </RadioGroup>
  ),
};

export const DisabledOption: Story = {
  render: () => (
    <RadioGroup label="Plan" defaultValue="basic">
      <Radio value="basic">Basic</Radio>
      <Radio value="pro" isDisabled>
        Pro (disabled)
      </Radio>
    </RadioGroup>
  ),
};

export const DisabledGroup: Story = {
  render: () => (
    <RadioGroup label="Disabled group" isDisabled defaultValue="a">
      <Radio value="a">A</Radio>
      <Radio value="b">B</Radio>
    </RadioGroup>
  ),
};

/** `trailing` — an extra slot after the label, same concept as `TabItem`'s
 * own `trailing`. */
export const WithTrailing: Story = {
  render: () => (
    <RadioGroup label="Choose a plan" defaultValue="basic">
      <Radio value="basic" trailing={<Text as="span" size="xsmall" color="secondary">Free</Text>}>
        Basic
      </Radio>
      <Radio value="pro" trailing={<Text as="span" size="xsmall" color="secondary">₹499/mo</Text>}>
        Pro
      </Radio>
    </RadioGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <RadioGroup label="Payment method" validationState="error" errorText="Select a payment method to continue.">
      <Radio value="upi">UPI</Radio>
      <Radio value="card">Card</Radio>
    </RadioGroup>
  ),
};

/** Real controlled `value`/`onChange` on RadioGroup. */
export const Controlled: Story = {
  render: () => {
    function ControlledExample() {
      const [value, setValue] = useState("a");
      return (
        <Box display="flex" flexDirection="column" gap="2">
          <RadioGroup label="Controlled group" value={value} onChange={(state) => setValue(state.value)}>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
            <Radio value="c">C</Radio>
          </RadioGroup>
          <Box display="flex" gap="2">
            <button onClick={() => setValue("a")}>Select A</button>
            <button onClick={() => setValue("b")}>Select B</button>
            <button onClick={() => setValue("c")}>Select C</button>
          </Box>
        </Box>
      );
    }
    return <ControlledExample />;
  },
};
