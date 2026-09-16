import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup/CheckboxGroup";
import { Box } from "../Box/Box";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
    validationState: { control: "select", options: ["none", "error", "success"] },
  },
  args: {
    children: "Accept terms and conditions",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default: unchecked, medium size. Real `<input type="checkbox">` under
 * the hood (via the shared `Selector` primitive) — click, Space, and real
 * keyboard Tab all work natively, no custom keyboard handling. */
export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

/** `isIndeterminate` sets the real DOM `indeterminate` IDL property (no
 * HTML attribute exists for it) and `aria-checked="mixed"` alongside it —
 * both mechanisms present, matching Blade's own real belt-and-suspenders
 * approach. Clicking an indeterminate checkbox checks it (native
 * semantics), it doesn't clear to unchecked. */
export const Indeterminate: Story = {
  args: { isIndeterminate: true },
};

export const Disabled: Story = {
  args: { isDisabled: true },
};

export const DisabledChecked: Story = {
  args: { isDisabled: true, defaultChecked: true },
};

/** `validationState="error"` + `errorText` renders via the same `FormHint`
 * component `TextInput`'s own error state uses. */
export const WithError: Story = {
  args: { validationState: "error", errorText: "You must accept the terms to continue." },
};

export const Sizes: Story = {
  render: () => (
    <Box display="flex" gap="4" alignItems="center">
      <Checkbox size="small">Small</Checkbox>
      <Checkbox size="medium">Medium</Checkbox>
      <Checkbox size="large">Large</Checkbox>
    </Box>
  ),
};

/** `CheckboxGroup` — "select all" indeterminate is NOT automatic, matching
 * Blade's real (non-obvious) behavior: the group doesn't aggregate its own
 * children's checked state. A consumer wanting a "select all" checkbox
 * computes `isIndeterminate` themselves, as done here, and renders it as a
 * standalone `Checkbox` outside the group's own children. See
 * decisions/decision-checkbox-group-no-auto-indeterminate.md. */
export const Group: Story = {
  render: () => {
    function GroupExample() {
      const fruits = ["apple", "banana", "cherry"];
      const [selected, setSelected] = useState<string[]>(["apple"]);
      const isAllSelected = selected.length === fruits.length;
      const isPartiallySelected = selected.length > 0 && !isAllSelected;
      return (
        <Box display="flex" flexDirection="column" gap="2">
          <Checkbox
            isChecked={isAllSelected}
            isIndeterminate={isPartiallySelected}
            onChange={({ isChecked }) => setSelected(isChecked ? fruits : [])}
          >
            Select all
          </Checkbox>
          <CheckboxGroup label="Favorite fruits" value={selected} onChange={({ values }) => setSelected(values)}>
            {fruits.map((fruit) => (
              <Checkbox key={fruit} value={fruit}>
                {fruit.charAt(0).toUpperCase() + fruit.slice(1)}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Box>
      );
    }
    return <GroupExample />;
  },
};

/** `orientation="horizontal"` + group-level `isDisabled` (cascades to
 * every child unless a child sets its own `isDisabled`). */
export const GroupHorizontalDisabled: Story = {
  render: () => (
    <CheckboxGroup label="Notification channels" orientation="horizontal" isDisabled defaultValue={["email"]}>
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
      <Checkbox value="push">Push</Checkbox>
    </CheckboxGroup>
  ),
};

/** Setting `isChecked`/`onChange` directly on a Checkbox nested inside a
 * CheckboxGroup is a real misuse (those become group-controlled) — this
 * project warns and degrades rather than throwing (Blade's real behavior),
 * matching the standing convention already established for IconButton and
 * Tabs. Open the browser console to see the warning. See
 * decisions/decision-checkbox-group-warn-not-throw.md. */
export const GroupControlledPropWarning: Story = {
  render: () => (
    <CheckboxGroup label="Misuse example (see console)" defaultValue={["a"]}>
      <Checkbox value="a" isChecked>
        A (isChecked set directly — ignored, group-controlled instead)
      </Checkbox>
      <Checkbox value="b">B</Checkbox>
    </CheckboxGroup>
  ),
};
