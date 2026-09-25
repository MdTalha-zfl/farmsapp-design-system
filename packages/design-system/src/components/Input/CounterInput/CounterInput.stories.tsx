import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CounterInput } from "./CounterInput";
import { Button } from "../../Button/Button";
import { Stack } from "../../Stack/Stack";
import { Text } from "../../Text/Text";

const meta = {
  title: "Components/Input/CounterInput",
  component: CounterInput,
  tags: ["autodocs"],
  args: { label: "Quantity" },
} satisfies Meta<typeof CounterInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: 1, min: 1, max: 99 },
};

export const EmptyIsAState: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Stack gap="2">
        <CounterInput {...args} value={value} onChange={({ value: next }) => setValue(next)} min={1} max={10} />
        <Text variant="caption" size="small">
          value: {value === null ? "null" : value}
        </Text>
      </Stack>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      {(["xsmall", "small", "medium", "large"] as const).map((size) => (
        <CounterInput key={size} label={size} size={size} defaultValue={5} max={20} />
      ))}
    </Stack>
  ),
};

/** `min < 0` allows a leading minus (and switches `inputMode` to `text`,
 * because iOS's numeric pad has no minus key). */
export const Negative: Story = {
  args: { label: "Temperature offset", min: -20, max: 20, defaultValue: 0 },
};

/** `step` for the buttons and arrow keys, `pageStep` for PageUp/PageDown. */
export const Steps: Story = {
  args: { label: "Bags of seed", min: 0, max: 500, step: 5, pageStep: 50, defaultValue: 25 },
};

/** Reaching a bound disables that button. If it had focus, focus moves to the
 * other button instead of being lost to the page. */
export const Bounds: Story = {
  args: { min: 0, max: 3, defaultValue: 2 },
};

/** Digits typed in Devanagari (and Bengali, Tamil, Arabic-Indic, full-width, …)
 * are converted to Latin digits as they are typed or pasted. Try `१२`. The
 * field always shows Latin digits. */
export const DevanagariDigits: Story = {
  args: { label: "मात्रा", defaultValue: 3, max: 99, decrementAccessibilityLabel: "मात्रा घटाएँ", incrementAccessibilityLabel: "मात्रा बढ़ाएँ" },
};

export const Validation: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(12);
    const tooMany = value !== null && value > 10;
    return (
      <CounterInput
        label="Guests"
        value={value}
        onChange={({ value: next }) => setValue(next)}
        max={20}
        validationState={tooMany ? "error" : "none"}
        errorText="This room sleeps 10"
        helpText="Up to 10 guests"
      />
    );
  },
};

export const LabelOnTheLeft: Story = {
  args: { labelPosition: "left", defaultValue: 2 },
};

/** No visible label: `accessibilityLabel` names the field for assistive tech. */
export const AccessibilityLabelOnly: Story = {
  args: { label: undefined, accessibilityLabel: "Quantity", defaultValue: 2 },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 4 },
};

/** `name` puts the *committed* value in a hidden input, so submitting with Enter
 * or a click never sends a half-typed draft. */
export const InAForm: Story = {
  render: () => {
    const [submitted, setSubmitted] = useState("");
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("qty")));
        }}
      >
        <Stack gap="3">
          <CounterInput label="Quantity" name="qty" defaultValue={2} max={50} />
          <Button type="submit">Add to cart</Button>
          <Text variant="caption" size="small">
            submitted: {submitted || "—"}
          </Text>
        </Stack>
      </form>
    );
  },
};
