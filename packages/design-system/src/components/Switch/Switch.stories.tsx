import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";
import { Box } from "../Box/Box";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium"] },
  },
  args: {
    children: "Enable notifications",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default: `children`-mode — real visible label text, no `aria-label` set
 * (visible text alone is the accessible name). Real `<input
 * type="checkbox" role="switch" aria-checked>` under the hood via the
 * shared `Selector` primitive. */
export const Default: Story = {};

/** No `children` — `accessibilityLabel` becomes `aria-label`, no visible
 * text at all. Matches Blade's only real mode; this project adds the
 * `children` mode above as a discriminated-union improvement. See
 * decisions/decision-switch-children-discriminated-union.md. */
export const NoVisibleLabel: Story = {
  args: { children: undefined, accessibilityLabel: "Enable notifications" } as never,
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { isDisabled: true },
};

export const DisabledChecked: Story = {
  args: { isDisabled: true, defaultChecked: true },
};

export const Sizes: Story = {
  render: () => (
    <Box display="flex" gap="4" alignItems="center">
      <Switch size="small">Small</Switch>
      <Switch size="medium">Medium</Switch>
    </Box>
  ),
};

/** Press-and-stretch — hold Space (after Tab-focusing) or press-and-hold
 * with the pointer to see the thumb stretch toward the direction of
 * travel, a purely cosmetic effect (local `isPressed` state, not tied to
 * any CSS pseudo-class) matching Blade's real
 * `handleKeyboardPressedIn/Out` mechanism. See
 * decisions/decision-switch-full-thumb-with-icon-and-press-effect.md. */
export const PressAndStretch: Story = {
  render: () => <Switch size="medium">Press and hold me (Space or pointer)</Switch>,
};

/** Real controlled `isChecked`/`onChange`. */
export const Controlled: Story = {
  render: () => {
    function ControlledExample() {
      const [isChecked, setIsChecked] = useState(false);
      return (
        <Switch isChecked={isChecked} onChange={(state) => setIsChecked(state.isChecked)}>
          {isChecked ? "On" : "Off"}
        </Switch>
      );
    }
    return <ControlledExample />;
  },
};
