import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, AlertCircleIcon } from "@farmsapp/icons";
import { Tooltip } from "./Tooltip";
import { TooltipInteractiveWrapper } from "./TooltipInteractiveWrapper";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "select",
      options: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"],
    },
    openDelay: { control: "number" },
    closeDelay: { control: "number" },
  },
  args: {
    content: "Hello world",
    placement: "top",
    children: <Button variant="secondary">Hover or Tab to me</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `title` + `content` — a two-line tooltip. */
export const WithTitle: Story = {
  render: () => (
    <Tooltip title="Refunds" content="Refunds typically take 5-7 business days to process." placement="bottom-start">
      <Button variant="tertiary">Titled tooltip</Button>
    </Tooltip>
  ),
};

/** `placement` — the full supported union (matches Blade's real exclusion
 * of left/right-start/end). `flip` middleware repositions automatically
 * near a viewport edge — these all render as requested here since there's
 * room. */
export const Placement: Story = {
  render: () => (
    <Inline gap="4" wrap>
      {(["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] as const).map((placement) => (
        <Tooltip key={placement} content={placement} placement={placement}>
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </Inline>
  ),
};

/** IconButton trigger — `aria-describedby` composes with IconButton's own
 * required `accessibilityLabel` (the accessible name), rather than racing
 * with it the way Blade's shipped fallback-`aria-label` does. See
 * decisions/decision-tooltip-aria-describedby.md. */
export const WithIconButtonTrigger: Story = {
  render: () => (
    <Tooltip content="Search records">
      <IconButton icon={SearchIcon} accessibilityLabel="Search" />
    </Tooltip>
  ),
};

/** A trigger with no built-in interactive semantics (a plain Icon) needs
 * `TooltipInteractiveWrapper` — Tooltip clones its child directly
 * (React.cloneElement, matching Blade's real mechanism) rather than
 * auto-wrapping every trigger in a `<div>`. See
 * decisions/decision-tooltip-adds-dismiss.md's sibling reasoning in
 * TooltipInteractiveWrapper.tsx for why this is opt-in, not automatic. */
export const NonInteractiveTrigger: Story = {
  render: () => (
    <Tooltip content="This field is required">
      <TooltipInteractiveWrapper>
        <AlertCircleIcon color="warning" />
      </TooltipInteractiveWrapper>
    </Tooltip>
  ),
};

/** Real controlled/uncontrolled `isOpen`/`defaultIsOpen`/`onOpenChange` via
 * this project's own `useControllableState` — a genuine addition beyond
 * Blade's real Tooltip, which has no controlled variant at all (only a
 * fire-only `onOpenChange` callback). See
 * decisions/decision-tooltip-controlled-uncontrolled.md. */
export const Controlled: Story = {
  render: () => {
    function ControlledExample() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Stack gap="2">
          <Tooltip content="Controlled tooltip" isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button variant="primary">Controlled trigger</Button>
          </Tooltip>
          <Button size="small" variant="tertiary" onClick={() => setIsOpen((v) => !v)}>
            Toggle externally
          </Button>
        </Stack>
      );
    }
    return <ControlledExample />;
  },
};

/** Hover delay (default 300ms open, 100ms close — deliberately asymmetric,
 * see decisions/decision-tooltip-asymmetric-delay.md) vs. keyboard focus (no delay —
 * Tab to the trigger below and the tooltip appears immediately, matching
 * Blade's real, tested behavior: a keyboard user can't "linger" the way a
 * mouse can). Escape closes it — a real addition beyond Blade's shipped
 * code, which has no useDismiss despite its own decisions.md documenting
 * "Esc should close the tooltip" as intent. See
 * decisions/decision-tooltip-adds-dismiss.md. */
export const DelayAndDismiss: Story = {
  render: () => (
    <Tooltip content="Try hovering, tabbing to, and pressing Escape while this is open" openDelay={300} closeDelay={300}>
      <Button variant="secondary">Focus, hover, or Escape</Button>
    </Tooltip>
  ),
};
