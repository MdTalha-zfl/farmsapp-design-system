import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, AlertCircleIcon } from "@farmsapp/icons";
import { Popover } from "./Popover";
import { PopoverInteractiveWrapper } from "./PopoverInteractiveWrapper";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "select",
      options: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"],
    },
  },
  args: {
    content: <Text variant="body">Popover content goes here.</Text>,
    placement: "top",
    children: <Button variant="secondary">Click me</Button>,
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `title`/`titleLeading` — "floating" mode, close button absolutely
 * positioned top-right, matching Blade's real behavior for a header-less
 * popover. */
export const Default: Story = {};

/** `title` + `titleLeading` — the header row, close button inline instead
 * of floating. */
export const WithTitle: Story = {
  render: () => (
    <Popover
      title="Refund policy"
      titleLeading={<AlertCircleIcon color="warning" />}
      content={<Text variant="body">Refunds typically take 5-7 business days to process.</Text>}
      placement="bottom-start"
    >
      <Button variant="tertiary">Titled popover</Button>
    </Popover>
  ),
};

/** `footer` — rendered as-is below the body, no built-in action-row layout. */
export const WithFooter: Story = {
  render: () => (
    <Popover
      title="Delete item"
      content={<Text variant="body">This action can't be undone.</Text>}
      footer={
        <Inline gap="2">
          <Button size="small" variant="tertiary">
            Cancel
          </Button>
          <Button size="small" variant="primary">
            Delete
          </Button>
        </Inline>
      }
    >
      <Button variant="secondary">Open with footer</Button>
    </Popover>
  ),
};

export const Placement: Story = {
  render: () => (
    <Inline gap="4" wrap>
      {(["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] as const).map((placement) => (
        <Popover key={placement} content={<Text variant="body">{placement}</Text>} placement={placement}>
          <Button variant="secondary">{placement}</Button>
        </Popover>
      ))}
    </Inline>
  ),
};

/** IconButton trigger — already a real focusable element, no wrapper needed. */
export const WithIconButtonTrigger: Story = {
  render: () => (
    <Popover content={<Text variant="body">Search across all records.</Text>}>
      <IconButton icon={SearchIcon} accessibilityLabel="Search" />
    </Popover>
  ),
};

/** A trigger with no built-in interactive semantics (a plain Icon) needs
 * `PopoverInteractiveWrapper` — unlike `TooltipInteractiveWrapper` (a
 * non-focusable `tabIndex={-1}` span, correct for a hover-only tooltip),
 * this renders a real `<button>` since Popover is click-triggered and its
 * content is focusable. See decisions/decision-popover-api-and-structure.md. */
export const NonInteractiveTrigger: Story = {
  render: () => (
    <Popover content={<Text variant="body">This field is required.</Text>}>
      <PopoverInteractiveWrapper aria-label="Field info">
        <AlertCircleIcon color="warning" />
      </PopoverInteractiveWrapper>
    </Popover>
  ),
};

/** Real controlled/uncontrolled `isOpen`/`defaultIsOpen`/`onOpenChange` via
 * this project's own `useControllableState`, matching Tooltip's pattern. */
export const Controlled: Story = {
  render: () => {
    function ControlledExample() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Stack gap="2">
          <Popover content={<Text variant="body">Controlled popover</Text>} isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button variant="primary">Controlled trigger</Button>
          </Popover>
          <Button size="small" variant="tertiary" onClick={() => setIsOpen((v) => !v)}>
            Toggle externally
          </Button>
        </Stack>
      );
    }
    return <ControlledExample />;
  },
};

/** Click the trigger to open, then try Tab (focus stays trapped inside,
 * cycling through the close button and any focusable content), Escape
 * (closes and returns focus to the trigger), or clicking outside. */
export const FocusTrapAndDismiss: Story = {
  render: () => (
    <Popover
      title="Keyboard test"
      content={
        <Stack gap="2">
          <Text variant="body">Tab cycles between these, Escape closes.</Text>
          <Button size="small" variant="secondary">
            Focusable action
          </Button>
        </Stack>
      }
    >
      <Button variant="secondary">Open and try Tab / Escape</Button>
    </Popover>
  ),
};
